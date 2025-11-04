import { Hono } from 'hono';
import { z } from 'zod';
import { getMetadata, saveMetadata, UserMetadata } from '../utils/metadata';
import { authMiddleware } from '../utils/middleware';

const updateSubscriptionSchema = z.object({
  subscription: z.enum(['free', 'premium']),
});

export const subscriptionRouter = new Hono();

subscriptionRouter.use('*', authMiddleware);

subscriptionRouter.get('/subscription', async (c) => {
  try {
    const user = c.get('user');
    const userData = await getMetadata<UserMetadata>('user', user.userId);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      subscription: userData.subscription,
      role: userData.role,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return c.json({ error: 'Failed to get subscription' }, 500);
  }
});

subscriptionRouter.post('/subscription', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const validated = updateSubscriptionSchema.parse(body);
    
    const userData = await getMetadata<UserMetadata>('user', user.userId);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Only allow admins to change subscriptions, or users can upgrade themselves
    if (user.role !== 'admin' && validated.subscription === 'premium') {
      // In production, this would check payment status
      // For now, allow self-upgrade
    }
    
    userData.subscription = validated.subscription;
    await saveMetadata('user', user.userId, userData);
    
    return c.json({
      success: true,
      subscription: userData.subscription,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Update subscription error:', error);
    return c.json({ error: 'Failed to update subscription' }, 500);
  }
});

