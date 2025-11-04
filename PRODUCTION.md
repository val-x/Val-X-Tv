# Production Deployment Guide

## ⚠️ Security Checklist

Before deploying to production, ensure you have completed all security steps:

### 1. Change Default Credentials

**CRITICAL**: Change all default credentials immediately!

```bash
# Generate strong JWT secret
openssl rand -base64 32

# Generate strong MinIO credentials
openssl rand -base64 16
```

Update in `config/coolify.env.example` or Coolify environment variables:
- `JWT_SECRET` - Use generated strong secret (minimum 32 characters)
- `MINIO_ACCESS_KEY` - Change from `valxadmin`
- `MINIO_SECRET_KEY` - Change from `valxsecret`

### 2. Environment Variables

**Required for Production:**
```env
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=<your-secure-access-key>
MINIO_SECRET_KEY=<your-secure-secret-key>
JWT_SECRET=<your-strong-jwt-secret>
PORT=8080
```

**Optional but Recommended:**
```env
JWT_EXPIRES_IN=7d
FFMPEG_PATH=ffmpeg
# IMPORTANT: Set to your public HTTPS URL (e.g., https://play.val-x.com)
# This prevents "Server Mismatch" errors in Jellyfin
JELLYFIN_URL=https://play.val-x.com
```

### 3. HTTPS/SSL Configuration

- Enable HTTPS in Coolify for all domains
- Use Let's Encrypt certificates
- Force HTTPS redirects
- Set secure cookie flags if using cookies

### 4. Firewall Rules

Restrict access to:
- **MinIO Console** (9000) - Internal network only
- **MinIO API** (9001) - Internal network only
- **API** (8080) - Public via reverse proxy only
- **Jellyfin** (8096) - Public via reverse proxy only

### 5. MinIO Security

1. **Access MinIO Console**: `https://minio.val-x.com` (using `*.val-x.com` base URL)
2. **Set bucket policies**:
   - Public read for `/fm-radio/` and `/tv-shows/` only
   - Signed URLs for all other content
   - Disable anonymous access on sensitive buckets
3. **Create IAM policies** for service accounts if needed

### 6. Database/Storage Backups

- **MinIO Data**: Set up regular backups of `/data/minio-data` volume
- **User Data**: MinIO `/users/` bucket contains all user accounts
- **Media Metadata**: MinIO `/videos/`, `/audio/`, `/courses/` buckets
- **Backup Strategy**: Daily automated backups recommended

### 7. Resource Limits

Set Docker resource limits in production:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '1'
      memory: 2G
```

### 8. Monitoring & Logging

- Enable Docker container logging
- Set up log rotation
- Monitor disk space (HLS transcoding uses significant space)
- Monitor API response times
- Set up alerts for service failures

### 9. First Admin User

Create your first admin user immediately after deployment:

```bash
curl -X POST https://api.val-x.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "StrongPassword123!",
    "role": "admin"
  }'
```

**Important**: Delete or disable the default admin account if one exists.

### 10. Content Security

- Validate all uploaded files
- Scan for malware before processing
- Limit file upload sizes
- Set rate limits on upload endpoints
- Monitor storage usage

## Performance Optimization

### MinIO

- Use SSD storage for MinIO data directory
- Enable MinIO compression
- Configure lifecycle policies for old segments
- Use MinIO distributed mode for high availability

### FFmpeg Transcoding

- Enable hardware acceleration if available
- Use appropriate quality presets
- Limit concurrent transcoding jobs
- Monitor CPU usage during transcoding

### API

- Enable response compression
- Cache static metadata
- Use connection pooling for MinIO
- Set appropriate timeouts

## Backup Strategy

### Automated Backups

```bash
# Backup MinIO data
docker run --rm -v valx_minio-data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-$(date +%Y%m%d).tar.gz /data

# Backup user data
docker exec valx-minio mc mirror /data/users /backup/users
```

### Restore Process

1. Stop services
2. Restore MinIO data volume
3. Restore MinIO buckets if needed
4. Restart services
5. Verify data integrity

## Scaling Considerations

### Single Server (Current Setup)

- Suitable for: < 1000 users, < 10TB content
- Resources: 4-8GB RAM, 4+ CPU cores, SSD storage

### Multi-Server (Future)

- Separate API server from MinIO
- Add dedicated transcoding node
- Use load balancer for API
- MinIO distributed mode for redundancy

## Maintenance

### Regular Tasks

- Weekly: Review logs for errors
- Monthly: Check disk space usage
- Quarterly: Review and update dependencies
- Annually: Security audit and credential rotation

### Updates

- Keep dependencies updated
- Monitor security advisories
- Test updates in staging first
- Backup before major updates

## Support & Troubleshooting

For issues, check:
1. Container logs: `docker logs <container-name>`
2. API health: `curl https://api.val-x.com/health` (using `*.val-x.com` base URL)
3. MinIO console: `https://minio.val-x.com` (using `*.val-x.com` base URL)
4. Disk space: `df -h`
5. Resource usage: `docker stats`

## Production Checklist

- [ ] All default credentials changed
- [ ] HTTPS enabled on all domains
- [ ] Firewall rules configured
- [ ] MinIO bucket policies set
- [ ] Backups configured and tested (see `scripts/backup.sh`)
- [ ] Resource limits set (configured in `deploy/docker-compose.yml`)
- [ ] Monitoring enabled (health endpoint at `/health`)
- [ ] First admin user created
- [ ] Content validation enabled (file size/type limits configured)
- [ ] Rate limiting configured (100 req/min default, 5 uploads/10min)
- [ ] Response compression enabled
- [ ] Logging configured
- [ ] Documentation reviewed
- [ ] Environment variables set in Coolify
- [ ] Backup cron job scheduled (see `scripts/crontab.example`)

