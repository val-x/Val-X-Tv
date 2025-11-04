import { Hono } from 'hono';
import { getMetadata, listMetadataIds, CourseMetadata } from '../utils/metadata';
import { optionalAuth, requirePremium } from '../utils/middleware';

export const coursesListRouter = new Hono();

coursesListRouter.use('*', optionalAuth);

coursesListRouter.get('/list', async (c) => {
  try {
    const user = c.get('user');
    
    // Get all course IDs
    const courseIds = await listMetadataIds('course');
    
    // Fetch metadata for each
    const courses: CourseMetadata[] = [];
    
    for (const id of courseIds) {
      const metadata = await getMetadata<CourseMetadata>('course', id);
      if (metadata) {
        // Filter premium courses for non-premium users
        if (metadata.premium && user.role !== 'admin' && user.subscription !== 'premium') {
          // Don't show premium courses, but could show limited info
          continue;
        }
        
        courses.push(metadata);
      }
    }
    
    // Sort by creation date (newest first)
    courses.sort((a, b) => b.createdAt - a.createdAt);
    
    return c.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('List courses error:', error);
    return c.json({ error: 'Failed to list courses' }, 500);
  }
});

