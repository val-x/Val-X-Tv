import { Hono } from 'hono';
import { getMetadata, listMetadataIds, MediaMetadata } from '../utils/metadata';
import { optionalAuth, requirePremium } from '../utils/middleware';
import { buckets } from '../utils/minio';

export const listRouter = new Hono();

listRouter.use('*', optionalAuth);

listRouter.get('/list', async (c) => {
  try {
    const user = c.get('user');
    const type = c.req.query('type') as 'movie' | 'tv' | 'audio' | 'course' | undefined;
    
    // Get all media IDs
    const bucket = type === 'audio' ? buckets.AUDIO : buckets.VIDEOS;
    const mediaIds = await listMetadataIds('media', bucket);
    
    // Fetch metadata for each
    const mediaList: MediaMetadata[] = [];
    
    for (const id of mediaIds) {
      const metadata = await getMetadata<MediaMetadata>('media', id);
      if (metadata) {
        // Filter by type if specified
        if (type && metadata.type !== type) {
          continue;
        }
        
        // Access control
        if (metadata.premium && user.role !== 'admin' && user.subscription !== 'premium') {
          // Skip premium content for non-premium users
          continue;
        }
        
        mediaList.push(metadata);
      }
    }
    
    // Sort by creation date (newest first)
    mediaList.sort((a, b) => b.createdAt - a.createdAt);
    
    return c.json({
      success: true,
      count: mediaList.length,
      media: mediaList,
    });
  } catch (error) {
    console.error('List media error:', error);
    return c.json({ error: 'Failed to list media' }, 500);
  }
});

