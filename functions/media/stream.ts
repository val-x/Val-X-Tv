import { Hono } from 'hono';
import { getMetadata, MediaMetadata } from '../utils/metadata';
import { getPresignedUrl, buckets } from '../utils/minio';
import { optionalAuth, requirePremium } from '../utils/middleware';

export const streamRouter = new Hono();

streamRouter.use('*', optionalAuth);

streamRouter.get('/stream/:id', async (c) => {
  try {
    const user = c.get('user');
    const mediaId = c.req.param('id');
    const quality = c.req.query('quality') || '720p'; // Default quality
    const language = c.req.query('language') || 'en'; // Default language
    
    // Get metadata
    const metadata = await getMetadata<MediaMetadata>('media', mediaId);
    
    if (!metadata) {
      return c.json({ error: 'Media not found' }, 404);
    }
    
    // Check access
    if (metadata.premium && user.role !== 'admin' && user.subscription !== 'premium') {
      return c.json({ error: 'Premium subscription required' }, 403);
    }
    
    // Determine bucket
    const bucket = metadata.type === 'audio' ? buckets.AUDIO : buckets.VIDEOS;
    
    // Generate presigned URL for HLS manifest
    const manifestPath = `${mediaId}/hls/${quality}/playlist.m3u8`;
    const manifestUrl = await getPresignedUrl(bucket, manifestPath, 3600); // 1 hour expiry
    
    // For segments, we'll need to generate URLs dynamically
    // For now, return the manifest URL and let the client handle segment requests
    return c.json({
      success: true,
      id: mediaId,
      title: metadata.title,
      type: metadata.type,
      manifestUrl,
      quality,
      language,
      // Note: Client will need to request segments with presigned URLs
      // This can be optimized with a segment proxy endpoint
    });
  } catch (error) {
    console.error('Stream error:', error);
    return c.json({ error: 'Failed to get stream URL' }, 500);
  }
});

