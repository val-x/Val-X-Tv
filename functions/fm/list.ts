import { Hono } from 'hono';
import { listObjects, buckets, getPresignedUrl } from '../utils/minio';
import { optionalAuth } from '../utils/middleware';

export const fmRouter = new Hono();

fmRouter.use('*', optionalAuth);

fmRouter.get('/list', async (c) => {
  try {
    // List all FM channels/playlists
    const objects = await listObjects(buckets.FM);
    
    const channels = await Promise.all(
      objects
        .filter(obj => obj.endsWith('.m3u8') || obj.endsWith('.json'))
        .map(async (obj) => {
          if (obj.endsWith('.json')) {
            // Get metadata
            const data = await import('fs/promises').then(fs => 
              fs.readFile(`/tmp/${obj}`).catch(() => null)
            );
            if (data) {
              return JSON.parse(data.toString());
            }
          }
          
          // Generate presigned URL for stream
          const streamUrl = await getPresignedUrl(buckets.FM, obj, 3600);
          
          return {
            id: obj.replace(/\.(m3u8|json)$/, ''),
            name: obj.split('/').pop()?.replace(/\.(m3u8|json)$/, '') || 'Unknown',
            streamUrl,
            type: obj.endsWith('.m3u8') ? 'hls' : 'metadata',
          };
        })
    );
    
    return c.json({
      success: true,
      count: channels.length,
      channels,
    });
  } catch (error) {
    console.error('FM list error:', error);
    return c.json({ error: 'Failed to list FM channels' }, 500);
  }
});

