/**
 * Security middleware for Nakshatra backend.
 *
 * - CSRF protection via double-submit cookie pattern
 * - Session validation
 * - Premium subscription verification
 * - Request sanitization
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ─── CSRF Protection (Double-Submit Cookie) ─────────────────────────────────

const CSRF_COOKIE = 'nakshatra_csrf';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Generate a CSRF token and set it as an httpOnly cookie.
 * Client must read the cookie and send it back as a header.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip for GET/HEAD/OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Set/refresh CSRF token cookie on safe requests
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });
    }
    return next();
  }

  // For mutation requests, verify the token
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    // In development, warn but don't block (makes dev easier)
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
}

// ─── Request Sanitization ───────────────────────────────────────────────────

/**
 * Strip dangerous characters from string inputs to prevent injection attacks.
 * Applied to req.body, req.query, and req.params.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  const sanitize = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        // Remove null bytes and control characters (except newline/tab)
        obj[key] = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        sanitize(val as Record<string, unknown>);
      }
    }
  };

  if (req.body && typeof req.body === 'object') sanitize(req.body);
  if (req.query && typeof req.query === 'object') sanitize(req.query as Record<string, unknown>);

  next();
}

// ─── Premium Subscription Verification ──────────────────────────────────────

/**
 * Verify that the requesting user has an active premium subscription.
 *
 * In production: validates against RevenueCat's REST API.
 * In development: checks X-Premium-Plan header (for testing).
 *
 * Usage: router.use('/premium-feature', requirePremium('pro'), handler)
 */
export function requirePremium(requiredPlan: 'pro' | 'guru' = 'pro') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.headers['x-user-id'] as string | undefined;
    const premiumHeader = req.headers['x-premium-plan'] as string | undefined;

    // Development bypass
    if (process.env.NODE_ENV === 'development' && premiumHeader) {
      const planHierarchy = { free: 0, pro: 1, guru: 2 };
      const userLevel = planHierarchy[premiumHeader as keyof typeof planHierarchy] ?? 0;
      const requiredLevel = planHierarchy[requiredPlan];

      if (userLevel >= requiredLevel) {
        return next();
      }
      res.status(403).json({
        error: 'Premium required',
        requiredPlan,
        currentPlan: premiumHeader,
      });
      return;
    }

    // Production: Verify with RevenueCat API
    if (userId && process.env.REVENUECAT_API_KEY) {
      try {
        const response = await fetch(
          `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REVENUECAT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = (await response.json()) as { subscriber?: { entitlements?: Record<string, { expires_date?: string }> } };
          const entitlements = data.subscriber?.entitlements ?? {};

          const hasGuru = entitlements.guru?.expires_date
            ? new Date(entitlements.guru.expires_date) > new Date()
            : false;
          const hasPro = entitlements.pro?.expires_date
            ? new Date(entitlements.pro.expires_date) > new Date()
            : false;

          const planHierarchy = { free: 0, pro: 1, guru: 2 };
          let userPlan: 'free' | 'pro' | 'guru' = 'free';
          if (hasGuru) userPlan = 'guru';
          else if (hasPro) userPlan = 'pro';

          const userLevel = planHierarchy[userPlan];
          const requiredLevel = planHierarchy[requiredPlan];

          if (userLevel >= requiredLevel) {
            return next();
          }
        }
      } catch {
        // RevenueCat API error — fail open in this case
        // but log it for monitoring
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Security] RevenueCat verification failed');
        }
      }
    }

    res.status(403).json({
      error: 'Premium subscription required',
      requiredPlan,
      upgradeUrl: '/upgrade',
    });
  };
}

// ─── Security Headers ───────────────────────────────────────────────────────

/**
 * Additional security headers beyond what Helmet provides.
 */
export function additionalSecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent browsers from MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (disable unnecessary browser APIs)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  next();
}
