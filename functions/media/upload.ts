import { Hono } from 'hono';
import { randomUUID } from 'crypto';
import { buckets, uploadFile } from '../utils/minio';
import { saveMetadata, MediaMetadata } from '../utils/metadata';
import { transcodeVideo, transcodeAudio, extractThumbnail, getDuration } from '../utils/ffmpeg';
import { requireAdmin } from '../utils/middleware';
import { uploadRateLimitMiddleware } from '../utils/rateLimit';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { readdir, stat } from 'fs/promises';

export const uploadRouter = new Hono();

uploadRouter.use('*', requireAdmin);
uploadRouter.use('*', uploadRateLimitMiddleware);

const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '10737418240'); // 10GB default
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac'];

uploadRouter.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'Untitled';
    const type = formData.get('type') as 'movie' | 'tv' | 'audio' | 'course';
    const premium = formData.get('premium') === 'true';
    const languages = (formData.get('languages') as string)?.split(',') || ['en'];
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // File size validation
    if (file.size > MAX_UPLOAD_SIZE) {
      return c.json({ 
        error: 'File too large', 
        message: `Maximum file size is ${MAX_UPLOAD_SIZE / 1073741824}GB` 
      }, 413);
    }
    
    // File type validation
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isVideo && !isAudio) {
      return c.json({ error: 'Invalid file type', message: 'Only video and audio files are allowed' }, 400);
    }
    
    // Additional type validation
    if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return c.json({ 
        error: 'Unsupported video format', 
        message: `Supported formats: ${ALLOWED_VIDEO_TYPES.join(', ')}` 
      }, 400);
    }
    
    if (isAudio && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return c.json({ 
        error: 'Unsupported audio format', 
        message: `Supported formats: ${ALLOWED_AUDIO_TYPES.join(', ')}` 
      }, 400);
    }
    
    // Generate unique ID
    const mediaId = randomUUID();
    const tempDir = join('/tmp', mediaId);
    await mkdir(tempDir, { recursive: true });
    
    try {
      // Save uploaded file temporarily
      const tempFilePath = join(tempDir, file.name);
      const arrayBuffer = await file.arrayBuffer();
      await writeFile(tempFilePath, Buffer.from(arrayBuffer));
      
      // Detect file type if not specified
      const detectedType = type || (file.type.startsWith('video/') ? 'movie' : 'audio');
      const isVideo = detectedType === 'movie' || detectedType === 'tv';
      const isAudio = detectedType === 'audio';
      
      // Get duration
      const duration = await getDuration(tempFilePath);
      
      // Transcode to HLS
      const outputDir = join(tempDir, 'hls');
      await mkdir(outputDir, { recursive: true });
      
      let hlsManifests: string[] = [];
      let qualities: string[] = [];
      
      if (isVideo) {
        hlsManifests = await transcodeVideo(tempFilePath, outputDir, ['480p', '720p']);
        qualities = ['480p', '720p'];
      } else if (isAudio) {
        hlsManifests = await transcodeAudio(tempFilePath, outputDir, ['96k', '128k']);
        qualities = ['96k', '128k'];
      }
      
      // Extract thumbnail for video
      let thumbnailPath: string | undefined;
      if (isVideo) {
        thumbnailPath = join(tempDir, 'thumbnail.jpg');
        await extractThumbnail(tempFilePath, thumbnailPath);
      }
      
      // Upload HLS files to MinIO
      const bucket = isVideo ? buckets.VIDEOS : buckets.AUDIO;
      
      // Upload main manifest and segments recursively
      async function uploadDirectory(dir: string, prefix: string = '') {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const objectName = prefix ? `${prefix}/${entry.name}` : entry.name;
          
          if (entry.isDirectory()) {
            await uploadDirectory(fullPath, objectName);
          } else if (entry.isFile()) {
            const minioObjectName = `${mediaId}/hls/${objectName}`;
            await uploadFile(bucket, minioObjectName, fullPath);
          }
        }
      }
      
      await uploadDirectory(outputDir);
      
      // Upload thumbnail
      if (thumbnailPath && existsSync(thumbnailPath)) {
        const thumbnailObjectName = `${mediaId}/thumbnail.jpg`;
        await uploadFile(buckets.THUMBNAILS, thumbnailObjectName, thumbnailPath, 'image/jpeg');
      }
      
      // Create metadata
      const metadata: MediaMetadata = {
        id: mediaId,
        title,
        type: detectedType,
        languages,
        qualities,
        premium,
        createdAt: Date.now(),
        duration,
        thumbnail: thumbnailPath ? `${mediaId}/thumbnail.jpg` : undefined,
      };
      
      // Save metadata
      await saveMetadata('media', mediaId, metadata);
      
      return c.json({
        success: true,
        id: mediaId,
        metadata,
      });
    } finally {
      // Cleanup temp files
      await rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

