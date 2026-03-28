import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, csrfProtection } from '../middleware/security';

/** Helper to create a minimal mock request */
function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    method: 'GET',
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

/** Helper to create a minimal mock response */
function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe('sanitizeInput middleware', () => {
  it('should strip null bytes from string values in body', () => {
    const req = mockReq({
      body: { name: 'hello\x00world', clean: 'fine' },
    });
    const res = mockRes();
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.name).toBe('helloworld');
    expect(req.body.clean).toBe('fine');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should strip control characters but preserve newlines and tabs', () => {
    const req = mockReq({
      body: { text: 'line1\nline2\ttab\x01hidden\x08back' },
    });
    const res = mockRes();
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.text).toBe('line1\nline2\ttabhiddenback');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should recursively sanitize nested objects', () => {
    const req = mockReq({
      body: { outer: { inner: 'test\x00value' } },
    });
    const res = mockRes();
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.outer.inner).toBe('testvalue');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should sanitize query parameters', () => {
    const req = mockReq({
      query: { search: 'term\x00injected' } as any,
    });
    const res = mockRes();
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.query.search).toBe('terminjected');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should leave non-string values untouched', () => {
    const req = mockReq({
      body: { count: 42, active: true, tags: ['a', 'b'] },
    });
    const res = mockRes();
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.count).toBe(42);
    expect(req.body.active).toBe(true);
    expect(req.body.tags).toEqual(['a', 'b']);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('csrfProtection middleware', () => {
  it('should allow GET requests and set a CSRF cookie if none exists', () => {
    const req = mockReq({ method: 'GET', cookies: {} });
    const res = mockRes();
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.cookie).toHaveBeenCalledWith(
      'nakshatra_csrf',
      expect.any(String),
      expect.objectContaining({
        sameSite: 'strict',
        path: '/',
      }),
    );
  });

  it('should allow GET requests without setting cookie if one already exists', () => {
    const req = mockReq({
      method: 'GET',
      cookies: { nakshatra_csrf: 'existing-token' },
    });
    const res = mockRes();
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('should allow POST in development mode even without CSRF token', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const req = mockReq({ method: 'POST', cookies: {} });
    const res = mockRes();
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    process.env.NODE_ENV = originalEnv;
  });

  it('should block POST in production when CSRF tokens do not match', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const req = mockReq({
      method: 'POST',
      cookies: { nakshatra_csrf: 'cookie-token' },
      headers: { 'x-csrf-token': 'different-token' },
    });
    const res = mockRes();
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid CSRF token' });

    process.env.NODE_ENV = originalEnv;
  });

  it('should allow POST in production when CSRF tokens match', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const token = 'valid-matching-token';
    const req = mockReq({
      method: 'POST',
      cookies: { nakshatra_csrf: token },
      headers: { 'x-csrf-token': token },
    });
    const res = mockRes();
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    process.env.NODE_ENV = originalEnv;
  });
});
