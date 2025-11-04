import { Hono } from 'hono';
import { z } from 'zod';
import { generateToken } from '../utils/jwt';
import { saveMetadata, getMetadata, UserMetadata } from '../utils/metadata';
import { buckets, objectExists } from '../utils/minio';
import { createHash } from 'crypto';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user', 'guest']).optional().default('user'),
});

export const registerRouter = new Hono();

registerRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validated = registerSchema.parse(body);
    
    // Check if user already exists
    const userId = createHash('sha256').update(validated.email).digest('hex').substring(0, 16);
    const existing = await getMetadata<UserMetadata>('user', userId);
    
    if (existing) {
      return c.json({ error: 'User already exists' }, 400);
    }
    
    // Hash password
    const passwordHash = createHash('sha256').update(validated.password).digest('hex');
    
    // Create user metadata
    const userMetadata: UserMetadata = {
      id: userId,
      email: validated.email,
      passwordHash,
      role: validated.role || 'user',
      subscription: 'free',
      createdAt: Date.now(),
    };
    
    // Save to MinIO
    await saveMetadata('user', userId, userMetadata);
    
    // Generate JWT token
    const token = generateToken({
      userId,
      role: userMetadata.role,
      subscription: userMetadata.subscription,
    });
    
    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        email: userMetadata.email,
        role: userMetadata.role,
        subscription: userMetadata.subscription,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

