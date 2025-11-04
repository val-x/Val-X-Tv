import { Hono } from 'hono';
import { getMetadata, CourseMetadata } from '../utils/metadata';
import { getPresignedUrl, buckets } from '../utils/minio';
import { optionalAuth, requirePremium } from '../utils/middleware';

export const courseDetailRouter = new Hono();

courseDetailRouter.use('*', optionalAuth);

courseDetailRouter.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const courseId = c.req.param('id');
    
    // Get course metadata
    const course = await getMetadata<CourseMetadata>('course', courseId);
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }
    
    // Check access
    if (course.premium && user.role !== 'admin' && user.subscription !== 'premium') {
      return c.json({ error: 'Premium subscription required' }, 403);
    }
    
    // Generate stream URLs for lessons
    const lessonsWithUrls = await Promise.all(
      course.lessons.map(async (lesson) => {
        // Get media metadata to get stream URL
        const mediaMetadata = await getMetadata('media', lesson.mediaId);
        let streamUrl: string | undefined;
        
        if (mediaMetadata) {
          const bucket = buckets.VIDEOS;
          const manifestPath = `${lesson.mediaId}/hls/720p/playlist.m3u8`;
          streamUrl = await getPresignedUrl(bucket, manifestPath, 3600);
        }
        
        return {
          ...lesson,
          streamUrl,
        };
      })
    );
    
    // Generate thumbnail URL if available
    let thumbnailUrl: string | undefined;
    if (course.thumbnail) {
      thumbnailUrl = await getPresignedUrl(buckets.THUMBNAILS, course.thumbnail, 3600);
    }
    
    return c.json({
      success: true,
      ...course,
      lessons: lessonsWithUrls,
      thumbnailUrl,
    });
  } catch (error) {
    console.error('Get course error:', error);
    return c.json({ error: 'Failed to get course' }, 500);
  }
});

