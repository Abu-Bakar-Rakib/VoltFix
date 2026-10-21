import request from 'supertest';
import app from '../src/app';
import { initializeMockData } from '../src/repositories/mockStore';

describe('Review Business Logic & Rating Recalculation', () => {
  let customerToken: string;
  let electricianToken: string;
  let completedBookingId: string;
  let pendingBookingId: string;
  let electricianProfileId: string;

  beforeAll(async () => {
    await initializeMockData();

    // Login customer 2
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nusrat.jahan@gmail.com', password: 'Customer@123' });
    customerToken = custRes.body.data.accessToken;

    // Login electrician 2
    const elecRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shahidul.alam@voltfix.com', password: 'Electrician@123' });
    electricianToken = elecRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/electricians/me/profile')
      .set('Authorization', `Bearer ${electricianToken}`);
    electricianProfileId = meRes.body.data.id;

    // Create a new booking 5 days in future (conflict free)
    const bookRes = await request(app)
      .post('/api/bookings/direct')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        electricianId: electricianProfileId,
        problemDescription: 'Install 4 ceiling downlights in master bedroom.',
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDurationMin: 60,
        isEmergency: false,
        addressStreet: 'House 14, Uttara',
        addressCity: 'Dhaka',
        addressLat: 23.871,
        addressLng: 90.401,
        customerPhone: '+8801822233344',
      });

    completedBookingId = bookRes.body.data.id;

    // Transition to completed
    await request(app)
      .patch(`/api/bookings/${completedBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({ status: 'ACCEPTED' });

    await request(app)
      .patch(`/api/bookings/${completedBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({ status: 'COMPLETED', reason: 'Job finished' });

    // Also create a PENDING booking 6 days in future
    const pendingRes = await request(app)
      .post('/api/bookings/direct')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        electricianId: electricianProfileId,
        problemDescription: 'Pending job test.',
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDurationMin: 60,
        isEmergency: false,
        addressStreet: 'House 14, Uttara',
        addressCity: 'Dhaka',
        addressLat: 23.871,
        addressLng: 90.401,
        customerPhone: '+8801822233344',
      });
    pendingBookingId = pendingRes.body.data.id;
  });

  let reviewId: string;

  it('should reject review submission if booking is not COMPLETED', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: pendingBookingId,
        rating: 5,
        comment: 'Great service before completion.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('completed jobs');
  });

  it('should successfully submit review for COMPLETED booking and recalculate average rating', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: completedBookingId,
        rating: 5,
        comment: 'Shahidul did a stellar job installing all 4 ceiling lights with zero mess. Very polite!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    reviewId = res.body.data.id;

    // Verify profile rating is updated
    const profileRes = await request(app).get(`/api/electricians/${electricianProfileId}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.reviewCount).toBeGreaterThanOrEqual(1);
  });

  it('should prevent submitting duplicate review for the same booking', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: completedBookingId,
        rating: 4,
        comment: 'Attempting to review twice.',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should allow electrician to reply to review', async () => {
    const res = await request(app)
      .post(`/api/reviews/${reviewId}/reply`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({
        replyComment: 'Thank you Nusrat! It was a pleasure working on your lighting.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.replyComment).toContain('pleasure working');
  });
});
