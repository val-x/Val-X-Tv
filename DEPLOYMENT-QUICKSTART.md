# Quick Deployment Guide

## One-Command Deploy (After Initial Setup)

```bash
# 1. Deploy backend services
cd deploy
docker-compose up -d

# 2. Deploy web apps (optional)
docker-compose -f docker-compose.web.yml up -d
```

## Coolify Deployment

### Initial Setup

1. **Create project** in Coolify: "valx-originals"
2. **Connect Git repository**
3. **Select deployment type**: Docker Compose
4. **Compose file**: `deploy/docker-compose.yml`
5. **Set environment variables** (see `config/coolify.env.example`)

### Required Environment Variables

```env
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=<your-secure-key>
MINIO_SECRET_KEY=<your-secure-secret>
JWT_SECRET=<generate-with-openssl-rand-base64-32>
PORT=8080
CORS_ORIGIN=*
MAX_UPLOAD_SIZE=10737418240
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### Domain Configuration

| Service | Domain | Port | Notes |
|---------|--------|------|-------|
| API | `api.val-x.com` | 8080 | Main API endpoint |
| MinIO Console | `minio.val-x.com` | 9000 | Internal/admin only |
| Jellyfin | `play.val-x.com` | 8096 | Media playback |
| Web Player | `val-x.com` | 3000 | User-facing player |
| Admin Panel | `admin.val-x.com` | 3001 | Admin dashboard |

### Post-Deployment

1. **Create admin user**:
   ```bash
   curl -X POST https://api.val-x.com/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"securepass","role":"admin"}'
   ```

2. **Verify MinIO buckets** (should auto-create on first API call)

3. **Test health endpoint**: `curl https://api.val-x.com/health`

## Build Scripts

```bash
# Build web apps
bash scripts/build-web.sh

# Deploy with Docker
bash scripts/deploy-web.sh --docker

# Backup MinIO data
bash scripts/backup.sh

# Restore from backup
bash scripts/restore.sh <backup-file.tar.gz>
```

## Troubleshooting

- **API not starting**: Check MinIO is running and environment variables are set
- **Build fails**: Ensure Node.js 18+ is installed and dependencies are installed
- **Upload errors**: Check disk space and FFmpeg installation
- **CORS errors**: Verify `CORS_ORIGIN` environment variable matches your domain

For detailed troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).

