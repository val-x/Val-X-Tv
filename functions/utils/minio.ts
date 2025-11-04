import { Client } from 'minio';

// Parse MinIO endpoint
const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
let endPoint: string;
let port: number;
let useSSL: boolean;

try {
  const url = new URL(endpoint);
  endPoint = url.hostname;
  port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 9000);
  useSSL = url.protocol === 'https:';
} catch {
  // Fallback: assume format like "localhost:9000" or "minio:9000"
  const parts = endpoint.replace(/^https?:\/\//, '').split(':');
  endPoint = parts[0] || 'localhost';
  port = parts[1] ? parseInt(parts[1]) : 9000;
  useSSL = endpoint.startsWith('https://');
}

const minioClient = new Client({
  endPoint,
  port,
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const buckets = {
  USERS: 'users',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  FM: 'fm',
  TV: 'tv',
  COURSES: 'courses',
  SUBSCRIPTIONS: 'subscriptions',
  THUMBNAILS: 'thumbnails',
};

/**
 * Initialize all required buckets
 */
export async function initBuckets(): Promise<void> {
  const bucketList = Object.values(buckets);
  
  for (const bucket of bucketList) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Created bucket: ${bucket}`);
    }
  }
}

/**
 * Upload file to MinIO
 */
export async function uploadFile(
  bucket: string,
  objectName: string,
  filePath: string | Buffer,
  contentType?: string
): Promise<string> {
  if (typeof filePath === 'string') {
    await minioClient.fPutObject(bucket, objectName, filePath, {
      'Content-Type': contentType || 'application/octet-stream',
    });
  } else {
    await minioClient.putObject(bucket, objectName, filePath, filePath.length, {
      'Content-Type': contentType || 'application/octet-stream',
    });
  }
  return objectName;
}

/**
 * Get file from MinIO
 */
export async function getFile(bucket: string, objectName: string): Promise<Buffer> {
  return await minioClient.getObject(bucket, objectName);
}

/**
 * Delete file from MinIO
 */
export async function deleteFile(bucket: string, objectName: string): Promise<void> {
  await minioClient.removeObject(bucket, objectName);
}

/**
 * List objects in bucket
 */
export async function listObjects(
  bucket: string,
  prefix?: string
): Promise<string[]> {
  const objects: string[] = [];
  const stream = minioClient.listObjects(bucket, prefix, true);
  
  for await (const obj of stream) {
    if (obj.name) {
      objects.push(obj.name);
    }
  }
  
  return objects;
}

/**
 * Generate presigned URL for object access
 */
export async function getPresignedUrl(
  bucket: string,
  objectName: string,
  expirySeconds: number = 604800 // 7 days default
): Promise<string> {
  return await minioClient.presignedGetObject(bucket, objectName, expirySeconds);
}

/**
 * Check if object exists
 */
export async function objectExists(bucket: string, objectName: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, objectName);
    return true;
  } catch {
    return false;
  }
}

export { minioClient };

