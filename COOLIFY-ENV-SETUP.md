# Coolify Environment Variables Setup Guide

## Required Environment Variables

Add these environment variables in Coolify Dashboard → Your Application → Environment Variables:

### MinIO Configuration (REQUIRED)
```
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=valxadmin
MINIO_SECRET_KEY=valxsecret
```

**⚠️ IMPORTANT:** Change `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` from defaults in production!

### JWT Configuration (REQUIRED)
```
JWT_SECRET=supersecretkey
```

**⚠️ CRITICAL:** Change `JWT_SECRET` to a strong random string in production!
```bash
# Generate a strong secret:
openssl rand -base64 32
```

### API Configuration (REQUIRED)
```
PORT=8080
CORS_ORIGIN=https://*.val-x.com,https://val-x.com
```

### Jellyfin Configuration (REQUIRED for Jellyfin service)
```
JELLYFIN_URL=https://play.val-x.com
```

**⚠️ IMPORTANT:** Must be your public HTTPS URL, NOT `http://localhost:8096`!

## Optional Environment Variables (Recommended)

### Rate Limiting
```
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### Upload Settings
```
MAX_UPLOAD_SIZE=10737418240
```

### JWT Expiration
```
JWT_EXPIRES_IN=7d
```

### FFmpeg Path (if FFmpeg is installed)
```
FFMPEG_PATH=ffmpeg
```

## Complete Environment Variables List

Copy this entire list to Coolify:

```env
# MinIO Configuration
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=valxadmin
MINIO_SECRET_KEY=valxsecret

# JWT Configuration
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d

# API Configuration
PORT=8080
CORS_ORIGIN=https://*.val-x.com,https://val-x.com

# Production Security Settings
MAX_UPLOAD_SIZE=10737418240
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Optional: FFmpeg Configuration
FFMPEG_PATH=ffmpeg

# Jellyfin Configuration
JELLYFIN_URL=https://play.val-x.com
```

## What Each Variable Does

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `MINIO_ENDPOINT` | MinIO server URL (internal Docker network) | `http://localhost:9000` | ✅ Yes |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` | ✅ Yes |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` | ✅ Yes |
| `JWT_SECRET` | Secret for JWT token signing | `supersecretkey` | ✅ Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | ⚠️ Recommended |
| `PORT` | API server port | `8080` | ✅ Yes |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | ✅ Yes |
| `MAX_UPLOAD_SIZE` | Maximum upload size in bytes | `10737418240` (10GB) | ⚠️ Recommended |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms | `60000` (1 min) | ⚠️ Recommended |
| `RATE_LIMIT_MAX` | Max requests per window | `100` | ⚠️ Recommended |
| `FFMPEG_PATH` | Path to FFmpeg binary | `ffmpeg` | Optional |
| `JELLYFIN_URL` | Public Jellyfin URL | `http://localhost:8096` | ✅ Yes (for Jellyfin) |

## Important Notes

### 1. Internal vs External URLs

- **`MINIO_ENDPOINT`**: Use `http://minio:9000` (internal Docker network name)
- **`JELLYFIN_URL`**: Use `https://play.val-x.com` (public HTTPS URL)

### 2. CORS Configuration

The `CORS_ORIGIN` supports wildcard subdomains:
- `https://*.val-x.com` - Allows all subdomains
- `https://val-x.com` - Allows root domain
- Multiple origins: `https://*.val-x.com,https://val-x.com,https://api.val-x.com`

### 3. Bucket Names

**Bucket names are NOT environment variables** - they're defined in code (`functions/utils/minio.ts`):
- `users`, `videos`, `audio`, `fm-radio`, `tv-shows`, `courses`, `subscriptions`, `thumbnails`

No need to configure bucket names in environment variables.

## Production Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string (minimum 32 characters)
- [ ] Change `MINIO_ACCESS_KEY` from `valxadmin`
- [ ] Change `MINIO_SECRET_KEY` from `valxsecret`
- [ ] Set `JELLYFIN_URL` to your public HTTPS URL
- [ ] Set `CORS_ORIGIN` to your actual domains
- [ ] Review rate limiting settings
- [ ] Set appropriate `MAX_UPLOAD_SIZE` for your use case

## How to Add in Coolify

1. Go to **Coolify Dashboard**
2. Select your **Val-X application**
3. Go to **Configuration** → **Environment Variables**
4. Click **"+ Add"** for each variable
5. Enter variable name and value
6. Click **"Save All Environment Variables"**
7. **Redeploy** the application for changes to take effect

## Verification

After setting environment variables and redeploying:

```bash
# Check if variables are set in container
docker exec <container-name> env | grep -E "MINIO|JWT|PORT|CORS"

# Test API health
curl https://api.val-x.com/health

# Check API logs
docker logs <container-name> | grep -i "starting\|error"
```

## Troubleshooting

### Variables Not Taking Effect

1. **Redeploy after setting variables** - Variables are only loaded on container start
2. **Check variable names** - Must match exactly (case-sensitive)
3. **Check for typos** - No extra spaces or quotes
4. **Check logs** - Look for errors in container logs

### Common Issues

- **MinIO connection fails**: Check `MINIO_ENDPOINT` is `http://minio:9000` (not `https://` or external URL)
- **JWT errors**: Check `JWT_SECRET` is set and matches across all instances
- **CORS errors**: Check `CORS_ORIGIN` includes your frontend domain
- **Jellyfin server mismatch**: Check `JELLYFIN_URL` is set to public HTTPS URL

