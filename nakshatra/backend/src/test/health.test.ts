import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'nakshatra-backend');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment');
  });

  it('should return valid ISO timestamp', async () => {
    const res = await request(app).get('/health');

    const timestamp = new Date(res.body.timestamp);
    expect(timestamp.toISOString()).toBe(res.body.timestamp);
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Route not found');
  });
});
