import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { systemDb } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'corbit-secret-key-change-in-prod';

export interface AuthRequest extends Request {
  user?: {
    email: string;
    tenantId: string;
    role: string;
    userId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};

// Middleware to ensure the user is accessing their own tenant's data
// In a real subdomain app, we'd check subdomain vs user.tenantId
export const validateTenantAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  // For this prototype, the tenant context is derived from the auth token.
  // We explicitly set the tenantId for downstream controllers to use.
  if (!req.user?.tenantId) {
     res.status(400).json({ error: 'Tenant context missing' });
     return;
  }
  
  // Check if tenant is active/trial valid
  const tenant = systemDb.prepare('SELECT * FROM tenants WHERE id = ?').get(req.user.tenantId) as any;
  
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }

  if (tenant.status === 'suspended') {
    res.status(402).json({ error: 'Account suspended. Please contact support.' });
    return;
  }

  // Trial expiration check
  if (tenant.plan === 'trial') {
    const trialEnd = new Date(tenant.trial_ends_at);
    if (new Date() > trialEnd) {
       // Allow GET requests (read-only) but block write operations
       if (req.method !== 'GET') {
         res.status(402).json({ error: 'Trial expired. Please upgrade to continue.' });
         return;
       }
       (req as any).isTrialExpired = true;
    }
  }

  next();
};
