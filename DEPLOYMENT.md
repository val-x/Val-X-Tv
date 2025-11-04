# Deployment Guide - Val-X Originals

## Quick Deploy to Coolify (KVM2 Server)

### Step 1: Prepare Repository

1. Push all code to GitHub/GitLab
2. Ensure all files are committed
3. Note the repository URL

### Step 2: Setup Coolify

1. **Access Coolify Dashboard**
2. **Create New Project**: "valx-originals"
3. **Add Application**: Choose "Git Repository"
4. **Connect Repository**: Enter your Git URL
5. **Select Branch**: `main` or `master`

### Step 3: Configure Deployment Type

1. **Deployment Type**: Select "Docker Compose"
2. **Compose File**: Use `docker-compose.yml` (root level)
   - Coolify will automatically find `docker-compose.yml` at the repository root
   - The file is already configured with correct paths for root-level builds
   - **Note**: Ports are exposed internally (not bound to host) - Coolify's Traefik handles routing
3. **Build Context**: Set to repository root (default)

### Step 4: Environment Variables

Add these environment variables in Coolify:

```
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=valxadmin
MINIO_SECRET_KEY=valxsecret
JWT_SECRET=your-secret-key-here
PORT=8080
JELLYFIN_URL=http://localhost:8096
```

**Important**: 
- Change `JWT_SECRET` to a strong random string (use `openssl rand -base64 32`)
- Change `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` for security

### Step 5: Configure Domains

**Base URL**: All services use `*.val-x.com` pattern

In Coolify, add domains for each service:

1. **API**: `api.val-x.com` → Port 8080
2. **MinIO Console**: `minio.val-x.com` → Port 9000
3. **Jellyfin**: `play.val-x.com` → Port 8096
4. **Web Player**: `val-x.com` or `www.val-x.com` → Port 3000 (or static hosting)
5. **Admin Panel**: `admin.val-x.com` → Port 3001 (or static hosting)

**Important**: Set `CORS_ORIGIN` to `https://*.val-x.com,https://val-x.com` in environment variables to allow all subdomains.

### Step 6: Deploy

1. Click **Deploy** in Coolify
2. Wait for build to complete (5-10 minutes first time)
3. Monitor logs for any errors

### Step 7: Initialize MinIO

After first deployment:

1. Access MinIO Console: `https://minio.val-x.com`
2. Login with your `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`
3. Buckets should auto-create on first API call
4. Verify buckets: `users`, `videos`, `audio`, `fm`, `tv`, `courses`, `subscriptions`, `thumbnails`

### Step 8: Create Admin User

Use the API to create first admin user:

```bash
curl -X POST https://api.val-x.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "role": "admin"
  }'
```

### Step 9: Deploy Web Apps

For web player and admin panel, you have two options:

#### Option A: Docker Compose (Recommended)

1. **Use the provided docker-compose file**:
   ```bash
   cd deploy
   docker-compose -f docker-compose.web.yml up -d
   ```

2. **Configure domains in Coolify**:
   - `val-x.com` → Port 3000 (Player)
   - `admin.val-x.com` → Port 3001 (Admin)

#### Option B: Static Site Hosting

1. **Build static files**:
   ```bash
   # Use the build script
   bash scripts/build-web.sh
   
   # Or manually:
   cd web/valx-player
   npm install
   npm run build
   
   cd ../valx-admin
   npm install
   npm run build
   ```

2. **Deploy to Coolify** as static sites:
   - Upload `web/valx-player/dist/` folder to static hosting
   - Upload `web/valx-admin/dist/` folder to static hosting
   - Or configure CI/CD to build and deploy automatically

3. **Set environment variables**:
   - Create `.env` files in each web app directory:
     ```
     VITE_API_URL=https://api.val-x.com
     ```
   - Or set in Coolify environment variables when using Docker
   - Rebuild after setting environment variables

## Local Development Setup

### Prerequisites

- Bun runtime installed
- Node.js 18+ (for web apps)
- Docker and Docker Compose
- FFmpeg installed

### Setup

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd valx-originals
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd functions
   bun install
   
   # Web Player
   cd ../web/valx-player
   npm install
   
   # Admin Panel
   cd ../valx-admin
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp config/coolify.env.example .env
   # Edit .env with your settings
   ```

4. **Start services**:
   ```bash
   cd deploy
   docker-compose up -d
   ```

5. **Run API locally**:
   ```bash
   cd functions
   bun run dev
   ```

6. **Run web apps**:
   ```bash
   # Terminal 1
   cd web/valx-player
   npm run dev
   
   # Terminal 2
   cd web/valx-admin
   npm run dev
   ```

## Troubleshooting

### API not starting

- Check MinIO is running: `docker ps | grep minio`
- Verify environment variables are set
- Check logs: `docker logs valx-api`

### MinIO connection errors

- Verify `MINIO_ENDPOINT` is correct
- Check MinIO container is on same network
- Ensure MinIO credentials match

### FFmpeg not found

- Install FFmpeg: `apt-get install ffmpeg` (Ubuntu) or `brew install ffmpeg` (macOS)
- Verify: `ffmpeg -version`
- Set `FFMPEG_PATH` in environment if needed

### Upload fails

- Check disk space (HLS transcoding creates many files)
- Verify FFmpeg is installed and accessible
- Check `/tmp` directory has write permissions
- Review API logs for detailed errors

## Production Checklist

- [ ] Changed default JWT_SECRET
- [ ] Changed default MinIO credentials
- [ ] Enabled HTTPS via Coolify
- [ ] Set up domain DNS records
- [ ] Configured SSL certificates
- [ ] Set up backups for MinIO data
- [ ] Configured monitoring/logging
- [ ] Set resource limits in Docker
- [ ] Enabled firewall rules
- [ ] Tested all endpoints
- [ ] Created admin user
- [ ] Uploaded initial content

## Scaling Considerations

- **Single Server**: Current setup runs on one KVM2 server
- **CDN**: Add Bunny or Cloudflare for media delivery
- **GPU Encoding**: Add separate node for transcoding
- **Backup Node**: Add secondary MinIO for redundancy
- **Load Balancer**: Add if serving multiple regions

