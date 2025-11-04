import { Hono } from 'hono';
import { getMetadata, UserMetadata } from '../utils/metadata';
import { authMiddleware } from '../utils/middleware';

export const meRouter = new Hono();

meRouter.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const userData = await getMetadata<UserMetadata>('user', user.userId);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Return user data without password hash
    return c.json({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      subscription: userData.subscription,
      profile: userData.profile,
      createdAt: userData.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

