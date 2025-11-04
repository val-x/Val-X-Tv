import { Hono } from 'hono';
import { z } from 'zod';
import { getMetadata, saveMetadata, UserMetadata } from '../utils/metadata';
import { authMiddleware } from '../utils/middleware';

const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const profileRouter = new Hono();

profileRouter.use('*', authMiddleware);

profileRouter.get('/profile', async (c) => {
  try {
    const user = c.get('user');
    const userData = await getMetadata<UserMetadata>('user', user.userId);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      subscription: userData.subscription,
      profile: userData.profile,
      createdAt: userData.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

profileRouter.post('/profile', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const validated = updateProfileSchema.parse(body);
    
    const userData = await getMetadata<UserMetadata>('user', user.userId);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Update profile
    userData.profile = {
      ...userData.profile,
      ...validated,
    };
    
    await saveMetadata('user', user.userId, userData);
    
    return c.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        subscription: userData.subscription,
        profile: userData.profile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

