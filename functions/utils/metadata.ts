import { minioClient, buckets, uploadFile, getFile, objectExists } from './minio';

export interface MediaMetadata {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'audio' | 'course';
  languages: string[];
  qualities?: string[];
  premium: boolean;
  createdAt: number;
  duration?: number;
  thumbnail?: string;
  description?: string;
}

export interface UserMetadata {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user' | 'guest';
  subscription: 'free' | 'premium';
  createdAt: number;
  profile?: {
    name?: string;
    avatar?: string;
  };
}

export interface CourseMetadata {
  id: string;
  title: string;
  description: string;
  premium: boolean;
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    mediaId: string;
    duration?: number;
  }>;
  createdAt: number;
  thumbnail?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

/**
 * Save metadata JSON to MinIO
 */
export async function saveMetadata(
  type: 'user' | 'media' | 'course' | 'subscription',
  id: string,
  metadata: any
): Promise<void> {
  let bucket: string;
  let path: string;
  
  switch (type) {
    case 'user':
      bucket = buckets.USERS;
      path = `${id}.json`;
      break;
    case 'media':
      bucket = buckets.VIDEOS; // or AUDIO based on media type
      path = `${id}/metadata.json`;
      break;
    case 'course':
      bucket = buckets.COURSES;
      path = `${id}/metadata.json`;
      break;
    case 'subscription':
      bucket = buckets.SUBSCRIPTIONS;
      path = 'plans.json';
      break;
  }
  
  const json = JSON.stringify(metadata, null, 2);
  await uploadFile(bucket, path, Buffer.from(json), 'application/json');
}

/**
 * Get metadata JSON from MinIO
 */
export async function getMetadata<T>(
  type: 'user' | 'media' | 'course' | 'subscription',
  id: string
): Promise<T | null> {
  let bucket: string;
  let path: string;
  
  switch (type) {
    case 'user':
      bucket = buckets.USERS;
      path = `${id}.json`;
      break;
    case 'media':
      bucket = buckets.VIDEOS;
      path = `${id}/metadata.json`;
      break;
    case 'course':
      bucket = buckets.COURSES;
      path = `${id}/metadata.json`;
      break;
    case 'subscription':
      bucket = buckets.SUBSCRIPTIONS;
      path = 'plans.json';
      break;
  }
  
  try {
    const exists = await objectExists(bucket, path);
    if (!exists) {
      return null;
    }
    
    const data = await getFile(bucket, path);
    return JSON.parse(data.toString()) as T;
  } catch (error) {
    console.error(`Error getting metadata for ${type}/${id}:`, error);
    return null;
  }
}

/**
 * List all metadata IDs
 */
export async function listMetadataIds(
  type: 'user' | 'media' | 'course',
  bucketOverride?: string
): Promise<string[]> {
  let bucket: string;
  
  switch (type) {
    case 'user':
      bucket = buckets.USERS;
      break;
    case 'media':
      bucket = bucketOverride || buckets.VIDEOS;
      break;
    case 'course':
      bucket = buckets.COURSES;
      break;
  }
  
  const objects = await minioClient.listObjects(bucket, '', true);
  const ids: string[] = [];
  
  for await (const obj of objects) {
    if (obj.name) {
      if (type === 'user') {
        const id = obj.name.replace('.json', '');
        if (id) ids.push(id);
      } else {
        const parts = obj.name.split('/');
        if (parts[0] && !ids.includes(parts[0])) {
          ids.push(parts[0]);
        }
      }
    }
  }
  
  return ids;
}

