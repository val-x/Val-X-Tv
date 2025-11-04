import { Hono } from 'hono';
import { listObjects, buckets, getPresignedUrl, getFile } from '../utils/minio';
import { optionalAuth } from '../utils/middleware';

export const tvRouter = new Hono();

tvRouter.use('*', optionalAuth);

tvRouter.get('/list', async (c) => {
  try {
    // Get M3U playlist from MinIO
    const playlistName = c.req.query('playlist') || 'default.m3u';
    const playlistPath = `${playlistName}`;
    
    // Check if playlist exists
    const objects = await listObjects(buckets.TV);
    const playlistExists = objects.some(obj => obj === playlistPath || obj.endsWith('.m3u'));
    
    if (!playlistExists && objects.length === 0) {
      // Return empty playlist structure
      return c.text('#EXTM3U\n', 200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
      });
    }
    
    // Get the first available playlist or the requested one
    const playlistFile = objects.find(obj => 
      obj === playlistPath || (objects.length === 1 && obj.endsWith('.m3u'))
    ) || objects[0];
    
    if (playlistFile) {
      const playlistData = await getFile(buckets.TV, playlistFile);
      const playlistText = playlistData.toString();
      
      // Generate presigned URLs for stream URLs in the playlist
      // This is a simplified version - in production, you'd parse and replace URLs
      const modifiedPlaylist = playlistText; // For now, return as-is
      
      return c.text(modifiedPlaylist, 200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
      });
    }
    
    // Return default empty playlist
    return c.text('#EXTM3U\n', 200, {
      'Content-Type': 'application/vnd.apple.mpegurl',
    });
  } catch (error) {
    console.error('TV list error:', error);
    return c.json({ error: 'Failed to get TV playlist' }, 500);
  }
});

