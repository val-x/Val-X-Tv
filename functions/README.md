# Val-X Originals API

Bun + Hono.js serverless API for Val-X Originals media platform.

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run production server
bun run start
```

## Environment Variables

- `MINIO_ENDPOINT` - MinIO server URL (default: http://localhost:9000)
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `JWT_SECRET` - Secret for JWT token generation
- `PORT` - Server port (default: 8080)
- `FFMPEG_PATH` - Path to FFmpeg binary (default: ffmpeg)

## API Endpoints

See main README.md for complete API documentation.

## Project Structure

- `auth/` - Authentication endpoints
- `user/` - User management
- `media/` - Media operations
- `fm/` - FM/Podcast endpoints
- `tv/` - TV/M3U endpoints
- `courses/` - Course endpoints
- `utils/` - Shared utilities (MinIO, JWT, FFmpeg, etc.)
- `gateway.js` - Main Hono router

