import { Hono } from 'hono';
import { z } from 'zod';
import { generateToken } from '../utils/jwt';
import { getMetadata, listMetadataIds, UserMetadata } from '../utils/metadata';
import { createHash } from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginRouter = new Hono();

loginRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validated = loginSchema.parse(body);
    
    // Find user by email
    const userId = createHash('sha256').update(validated.email).digest('hex').substring(0, 16);
    const user = await getMetadata<UserMetadata>('user', userId);
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const passwordHash = createHash('sha256').update(validated.password).digest('hex');
    if (user.passwordHash !== passwordHash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      subscription: user.subscription,
    });
    
    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        profile: user.profile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

