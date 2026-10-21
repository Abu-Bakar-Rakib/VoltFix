import request from 'supertest';
import app from '../src/app';
import { initializeMockData } from '../src/repositories/mockStore';

describe('Booking Endpoints, Conflict Checks & Status Flow', () => {
  let customerToken: string;
  let customerId: string;
  let electricianToken: string;
  let electricianUserId: string;
  let electricianProfileId: string;

  beforeAll(async () => {
    await initializeMockData();

    // Login customer 1
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arif.chowdhury@gmail.com', password: 'Customer@123' });
    customerToken = custRes.body.data.accessToken;
    customerId = custRes.body.data.user.id;

    // Login electrician 1
    const elecRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tariqul.electric@gmail.com', password: 'Electrician@123' });
    electricianToken = elecRes.body.data.accessToken;
    electricianUserId = elecRes.body.data.user.id;

    // Get electrician profile ID
    const meRes = await request(app)
      .get('/api/electricians/me/profile')
      .set('Authorization', `Bearer ${electricianToken}`);
    electricianProfileId = meRes.body.data.id;
  });

  const scheduledSlot = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 2 days in future
  let createdBookingId: string;

  it('should successfully create a direct booking', async () => {
    const res = await request(app)
      .post('/api/bookings/direct')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        electricianId: electricianProfileId,
        problemDescription: 'Kitchen ceiling light sparking whenever AC starts.',
        scheduledAt: scheduledSlot,
        estimatedDurationMin: 60,
        isEmergency: false,
        addressStreet: 'House 55, Road 7, Banani',
        addressCity: 'Dhaka',
        addressLat: 23.7937,
        addressLng: 90.4066,
        customerPhone: '+8801711122233',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.bookingNumber).toBeDefined();
    createdBookingId = res.body.data.id;
  });

  it('should prevent double booking for overlapping time slot (Conflict check)', async () => {
    // Attempt to book same electrician at exact same slot
    const res = await request(app)
      .post('/api/bookings/direct')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        electricianId: electricianProfileId,
        problemDescription: 'Second booking request attempting to conflict.',
        scheduledAt: scheduledSlot,
        estimatedDurationMin: 60,
        isEmergency: false,
        addressStreet: 'House 99, Gulshan',
        addressCity: 'Dhaka',
        addressLat: 23.7925,
        addressLng: 90.4078,
        customerPhone: '+8801711122233',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('confirmed booking during this time slot');
  });

  it('should allow assigned electrician to accept booking', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({
        status: 'ACCEPTED',
        reason: 'Confirmed appointment for Friday morning.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('should progress through ON_THE_WAY and IN_PROGRESS to COMPLETED', async () => {
    // 1. ON_THE_WAY
    let res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({ status: 'ON_THE_WAY', reason: 'Dispatched on motorcycle' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ON_THE_WAY');

    // 2. IN_PROGRESS
    res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({ status: 'IN_PROGRESS', reason: 'Working on circuit box' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');

    // 3. COMPLETED
    res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${electricianToken}`)
      .send({ status: 'COMPLETED', reason: 'Repairs done and certified' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});
