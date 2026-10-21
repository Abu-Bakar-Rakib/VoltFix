import request from 'supertest';
import app from '../src/app';
import { initializeMockData } from '../src/repositories/mockStore';

describe('Auth Endpoints & Business Logic', () => {
  beforeAll(async () => {
    await initializeMockData();
  });

  const uniqueEmail = `test.user.${Date.now()}@example.com`;

  it('should successfully register a new customer', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: uniqueEmail,
        password: 'Password123',
        phone: '+8801700998877',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.accessToken).toBeDefined();
    // Refresh token should be in Set-Cookie header
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject registration if email is already in use', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: uniqueEmail,
        password: 'Password123',
        phone: '+8801700998877',
        role: 'CUSTOMER',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should successfully log in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.name).toBe('Test Customer');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should retrieve current user profile with valid Bearer token', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123',
      });

    const token = loginRes.body.data.accessToken;

    // 2. Fetch /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(uniqueEmail.toLowerCase());
  });

  it('should reject protected /me endpoint without Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
