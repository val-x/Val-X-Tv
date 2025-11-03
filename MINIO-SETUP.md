# MinIO Storage Setup Guide

## 🎯 Overview

This setup provides:
- **Centralized Object Storage** via MinIO (S3-compatible)
- **Shared File Storage** between ErsatzTV, AzuraCast, and Jellyfin
- **Automatic Backup** to MinIO every 5 minutes

## 📊 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  ErsatzTV   │     │  AzuraCast  │     │   Jellyfin  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Shared Volumes        │
              │  (shared-videos,        │
              │   shared-audio,         │
              │   shared-output)       │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   MinIO Sync Service   │
              │  (uploads every 5min)  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │      MinIO Storage      │
              │   (S3-compatible)      │
              └─────────────────────────┘
```

## 🚀 Quick Start

### 1. Initial Deployment

The setup is already configured in `docker-compose.yml`. Just deploy:

```bash
docker-compose up -d
```

### 2. Access MinIO Console

- **URL:** `http://localhost:9000` (or your server IP)
- **Username:** `minioadmin`
- **Password:** `minioadmin`

⚠️ **Change the default password immediately in production!**

### 3. Verify Buckets

After first deployment, you should see these buckets in MinIO:
- `videos` - Music videos (shared with ErsatzTV and Jellyfin)
- `audio` - Audio files (shared with AzuraCast and Jellyfin)
- `ersatztv-output` - ErsatzTV generated content (shared with Jellyfin)

## 📁 File Sharing

### How It Works

1. **Shared Docker Volumes:**
   - All services mount the same named volumes
   - Files written by one service are immediately visible to others
   - No network latency - direct filesystem access

2. **MinIO Backup:**
   - `minio-sync` service runs in background
   - Syncs shared volumes to MinIO every 5 minutes
   - Provides backup and remote access capability

### Volume Mappings

| Service | Volume | Mount Point | Access |
|---------|--------|------------|--------|
| ErsatzTV | `shared-videos` | `/media/music-videos` | Read-only |
| ErsatzTV | `shared-output` | `/output` | Read-Write |
| AzuraCast | `shared-audio` | `/var/azuracast/music` | Read-only |
| Jellyfin | `shared-videos` | `/data/music-videos` | Read-only |
| Jellyfin | `shared-audio` | `/data/music-audio` | Read-only |
| Jellyfin | `shared-output` | `/data/live-tv` | Read-only |

## 🔧 Configuration

### Change MinIO Credentials

1. **Update docker-compose.yml:**
   ```yaml
   minio:
     environment:
       - MINIO_ROOT_USER=your-username
       - MINIO_ROOT_PASSWORD=your-secure-password
   ```

2. **Update minio-init service credentials:**
   ```yaml
   minio-init:
     command: -c "
       /usr/bin/mc alias set myminio http://minio:9000 your-username your-secure-password;
       ...
     "
   ```

3. **Update minio-sync service credentials:**
   ```yaml
   minio-sync:
     command: -c "
       /usr/bin/mc alias set myminio http://minio:9000 your-username your-secure-password;
       ...
     "
   ```

### Adjust Sync Frequency

Edit the `minio-sync` service in docker-compose.yml:

```yaml
minio-sync:
  command: -c "
    ...
    sleep 300;  # Change 300 to desired seconds (300 = 5 minutes)
  "
```

## 📤 Uploading Files to Shared Storage

### Method 1: Direct Volume Access

Copy files directly to shared volumes:

```bash
# Find volume location
docker volume inspect val-x-tvfm-management_shared-videos

# Copy files (example)
docker cp video.mp4 jellyfin-val-x:/data/music-videos/
```

### Method 2: Via MinIO Console

1. Access MinIO console at `http://localhost:9000`
2. Navigate to the bucket (e.g., `videos`)
3. Upload files via web UI
4. Files will be available in shared volumes after sync

### Method 3: Via MinIO API (S3-compatible)

Use any S3-compatible client:

```bash
# Install MinIO client
curl https://dl.min.io/client/mc/release/linux-amd64/mc \
  --create-dirs \
  -o ~/bin/mc
chmod +x ~/bin/mc

# Configure
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Upload file
mc cp video.mp4 myminio/videos/
```

## 🔍 Monitoring

### Check Sync Status

```bash
docker logs minio-sync
```

### Check MinIO Status

```bash
docker logs minio-storage
```

### Verify Shared Volumes

```bash
# List shared volumes
docker volume ls | grep shared

# Inspect volume
docker volume inspect val-x-tvfm-management_shared-videos
```

## 🛠️ Troubleshooting

### Files Not Appearing in Services

1. **Check volume mounts:**
   ```bash
   docker inspect ersatztv | grep -A 10 Mounts
   ```

2. **Verify files in volume:**
   ```bash
   docker exec jellyfin-val-x ls -la /data/music-videos
   ```

3. **Check permissions:**
   - All services use PUID=1000, PGID=1000
   - Files should be owned by user 1000:1000

### MinIO Sync Not Working

1. **Check minio-sync logs:**
   ```bash
   docker logs minio-sync
   ```

2. **Verify MinIO is accessible:**
   ```bash
   docker exec minio-sync mc alias list
   ```

3. **Restart sync service:**
   ```bash
   docker restart minio-sync
   ```

### MinIO Console Not Accessible

1. **Check MinIO service:**
   ```bash
   docker ps | grep minio
   ```

2. **Verify ports are open:**
   - Port 9000 (Console)
   - Port 9001 (API)

3. **Check firewall rules**

## 🔒 Security Recommendations

1. **Change default credentials** immediately
2. **Use environment variables** for credentials (don't hardcode)
3. **Enable MinIO TLS/HTTPS** for production
4. **Restrict MinIO access** to internal network only
5. **Set up proper bucket policies** in MinIO console
6. **Regular backups** of MinIO data directory

## 📈 Performance Tips

- **SSD storage** for MinIO data directory improves performance
- **Adjust sync frequency** based on your needs (more frequent = more overhead)
- **Monitor disk space** - MinIO stores copies of all files
- **Use MinIO for backup** - Keep local volumes as primary storage for speed

## 📚 Additional Resources

- [MinIO Documentation](https://min.io/docs/)
- [MinIO S3 Compatibility](https://min.io/docs/minio/container/administration/identity-access-management/s3-api-compatibility.html)
- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)

