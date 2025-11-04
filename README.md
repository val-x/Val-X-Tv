# Val-X Originals (KVM2 Edition)

A lightweight, full-featured, self-hosted media platform for movies, TV, FM, music, and courses — built with Jellyfin + MinIO + Bun (Hono.js) serverless APIs + React Web + Expo App. Runs entirely on a single KVM2 server with Coolify.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Val-X Originals                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React Player │  │ React Admin  │  │  Expo App    │ │
│  │  (Web UI)    │  │   (Admin)    │  │  (Mobile)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │       │
│         └──────────────────┼──────────────────┘       │
│                            │                           │
│                   ┌────────▼────────┐                  │
│                   │  Bun + Hono.js  │                  │
│                   │   API Gateway   │                  │
│                   └────────┬────────┘                  │
│                            │                           │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│  ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐  │
│  │   MinIO     │  │   Jellyfin   │  │   FFmpeg    │  │
│  │  (Storage)  │  │  (Playback)  │  │ (Transcode) │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Multi-format Media**: Movies, TV shows, music, FM radio, podcasts, and courses
- **HLS Streaming**: Adaptive bitrate streaming with 480p/720p video and 96k/128k audio
- **Multi-language Support**: Separate audio tracks per language
- **User Authentication**: JWT-based auth with role-based access (admin/user/guest)
- **Subscription System**: Free and premium tiers
- **Admin Panel**: Upload, manage users, and configure plans
- **Self-hosted**: Runs entirely on your KVM2 server
- **MinIO Storage**: S3-compatible object storage
- **No Database**: All metadata stored as JSON in MinIO

## Quick Start

### Prerequisites

- Bun runtime installed
- Docker and Docker Compose
- FFmpeg installed (for transcoding)
- Coolify (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Val-X-Originals
```

2. Install dependencies:
```bash
cd functions && bun install
cd ../web/valx-player && npm install
cd ../valx-admin && npm install
```

3. Configure environment variables:
```bash
cp config/coolify.env.example .env
# Edit .env with your settings
```

4. Start services:
```bash
cd deploy
docker-compose up -d
```

5. Initialize MinIO buckets (first run):
```bash
# Buckets are auto-created on first API call
# Or manually via MinIO console at http://localhost:9000
```

## Project Structure

```
Val-X-Originals/
├── functions/          # Bun + Hono.js API
│   ├── auth/         # Authentication endpoints
│   ├── user/         # User management
│   ├── media/        # Media operations
│   ├── fm/           # FM/Podcast endpoints
│   ├── tv/           # TV/M3U endpoints
│   ├── courses/      # Course endpoints
│   ├── utils/        # Shared utilities
│   └── gateway.js    # Main router
├── web/
│   ├── valx-player/  # React web player
│   └── valx-admin/   # React admin panel
├── app/              # Expo mobile app (future)
├── config/           # Configuration files
└── deploy/           # Deployment configs
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Media
- `POST /media/upload` - Upload media (admin only)
- `GET /media/list?type=movie` - List media
- `GET /media/stream/:id` - Get HLS stream URL
- `GET /media/metadata/:id` - Get media metadata

### User
- `GET /user/profile` - Get user profile
- `POST /user/profile` - Update profile
- `GET /user/subscription` - Get subscription status
- `POST /user/subscription` - Change subscription

### FM/TV
- `GET /fm/list` - List FM channels
- `GET /tv/list` - Get M3U playlist

### Courses
- `GET /courses/list` - List courses
- `GET /courses/:id` - Get course details

## MinIO Bucket Structure

- `/users/` - User profiles (JSON)
- `/videos/` - Video media (HLS + metadata)
- `/audio/` - Audio media (HLS + metadata)
- `/fm/` - FM channel streams
- `/tv/` - M3U playlists
- `/courses/` - Course data and metadata
- `/subscriptions/` - Subscription plans (JSON)
- `/thumbnails/` - Media thumbnails

## User Roles

| Role | Permissions |
|------|-------------|
| admin | Full access: upload, edit, delete, manage users |
| user | View content, update own profile/subscription |
| guest | Access only free content (FM, TV) |

## Subscription Plans

Default plans (stored in `/subscriptions/plans.json`):

- **Free**: FM, TV, free content
- **Premium**: All content including movies and courses

## Deployment on Coolify

**Base URL**: All services use `*.val-x.com` pattern

1. Create new project in Coolify
2. Connect Git repository
3. Select "Docker Compose" deployment
4. Use `deploy/coolify.yaml` configuration
5. Set environment variables in Coolify (see `config/coolify.env.example`)
6. Configure domains: `api.val-x.com`, `minio.val-x.com`, `play.val-x.com`, etc.
7. Deploy!

## Environment Variables

See `config/coolify.env.example` for all required variables:

- `MINIO_ENDPOINT` - MinIO server URL
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - API server port (default: 8080)

## Development

### Backend API
```bash
cd functions
bun run dev
```

### Web Player
```bash
cd web/valx-player
npm run dev
```

### Admin Panel
```bash
cd web/valx-admin
npm run dev
```

## Production Deployment

**⚠️ IMPORTANT**: Before deploying to production, review the [PRODUCTION.md](PRODUCTION.md) guide for:
- Security checklist
- Credential management
- HTTPS/SSL configuration
- Backup strategies
- Performance optimization
- Monitoring setup

Quick production checklist:
1. **Change default credentials** in environment variables
2. **Use strong JWT_SECRET** (generate with `openssl rand -base64 32`)
3. **Enable HTTPS** via Coolify reverse proxy
4. **Set up backups** for MinIO data directory
5. **Configure FFmpeg** for hardware acceleration if available
6. **Monitor disk space** - HLS transcoding creates multiple files

## Roadmap

- [x] Backend API (Bun + Hono.js)
- [x] Web player (React)
- [x] Admin panel (React)
- [ ] Mobile app (Expo)
- [ ] CDN integration (Bunny/Cloudflare)
- [ ] Payment integration (Razorpay)
- [ ] GPU encoding node
- [ ] Backup MinIO node

## License

This project is self-hosted and free to use.

## Documentation

- [README.md](README.md) - This file, overview and quick start
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide for Coolify
- [COOLIFY-SETUP.md](COOLIFY-SETUP.md) - Coolify-specific configuration and setup
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Comprehensive troubleshooting guide
- [PRODUCTION.md](PRODUCTION.md) - Production security and best practices
- [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Implementation details

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.
