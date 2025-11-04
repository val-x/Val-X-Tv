import { Hono } from 'hono';
import { getMetadata, MediaMetadata } from '../utils/metadata';
import { getPresignedUrl, buckets } from '../utils/minio';
import { optionalAuth } from '../utils/middleware';

export const metadataRouter = new Hono();

metadataRouter.use('*', optionalAuth);

metadataRouter.get('/metadata/:id', async (c) => {
  try {
    const user = c.get('user');
    const mediaId = c.req.param('id');
    
    // Get metadata
    const metadata = await getMetadata<MediaMetadata>('media', mediaId);
    
    if (!metadata) {
      return c.json({ error: 'Media not found' }, 404);
    }
    
    // Check access
    if (metadata.premium && user.role !== 'admin' && user.subscription !== 'premium') {
      return c.json({ error: 'Premium subscription required' }, 403);
    }
    
    // Generate thumbnail URL if available
    let thumbnailUrl: string | undefined;
    if (metadata.thumbnail) {
      thumbnailUrl = await getPresignedUrl(buckets.THUMBNAILS, metadata.thumbnail, 3600);
    }
    
    return c.json({
      success: true,
      ...metadata,
      thumbnailUrl,
    });
  } catch (error) {
    console.error('Get metadata error:', error);
    return c.json({ error: 'Failed to get metadata' }, 500);
  }
});

