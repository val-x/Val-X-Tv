import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initBuckets } from './utils/minio.js';
import { registerRouter } from './auth/register.js';
import { loginRouter } from './auth/login.js';
import { meRouter } from './auth/me.js';
import { profileRouter } from './user/profile.js';
import { subscriptionRouter } from './user/subscription.js';
import { uploadRouter } from './media/upload.js';
import { listRouter } from './media/list.js';
import { streamRouter } from './media/stream.js';
import { metadataRouter } from './media/metadata.js';
import { fmRouter } from './fm/list.js';
import { tvRouter } from './tv/list.js';
import { coursesListRouter } from './courses/list.js';
import { courseDetailRouter } from './courses/detail.js';

const app = new Hono();

// Initialize MinIO buckets on startup
initBuckets().catch(console.error);

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Auth routes
app.route('/auth', registerRouter);
app.route('/auth', loginRouter);
app.route('/auth', meRouter);

// User routes
app.route('/user', profileRouter);
app.route('/user', subscriptionRouter);

// Media routes
app.route('/media', uploadRouter);
app.route('/media', listRouter);
app.route('/media', streamRouter);
app.route('/media', metadataRouter);

// FM routes
app.route('/fm', fmRouter);

// TV routes
app.route('/tv', tvRouter);

// Course routes
app.route('/courses', coursesListRouter);
app.route('/courses', courseDetailRouter);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = parseInt(process.env.PORT || '8080');

console.log(`🚀 Val-X Originals API starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};

