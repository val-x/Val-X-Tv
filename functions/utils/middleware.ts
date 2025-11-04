import { Context, Next } from 'hono';
import { verifyToken, extractToken, JWTPayload } from './jwt';

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));
  
  if (!token) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
  
  c.set('user', payload);
  await next();
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: ('admin' | 'user' | 'guest')[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }
    
    await next();
  };
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Premium subscription check middleware
 */
export async function requirePremium(c: Context, next: Next) {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  if (user.role === 'admin') {
    // Admins have access to everything
    await next();
    return;
  }
  
  if (user.subscription !== 'premium') {
    return c.json({ error: 'Premium subscription required' }, 403);
  }
  
  await next();
}

/**
 * Optional authentication - sets user if token exists, but doesn't fail if missing
 */
export async function optionalAuth(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  } else {
    // Set guest user if no token
    c.set('user', {
      userId: 'guest',
      role: 'guest',
      subscription: 'free',
    } as JWTPayload);
  }
  
  await next();
}

