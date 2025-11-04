# Troubleshooting Guide - Val-X Originals

## Service Health Issues

### Services Showing "Degraded (unhealthy)" or "No Available Server"

This typically indicates one of the following issues:

#### 1. Services Not Running

**Check container status:**
```bash
# SSH into your server
docker ps -a | grep valx
```

**Expected output should show all containers running:**
- `valx-api` - Status: Up
- `valx-minio` - Status: Up  
- `valx-jellyfin` - Status: Up

**If containers are not running:**
```bash
# Check logs
docker logs valx-api
docker logs valx-minio
docker logs valx-jellyfin

# Restart services
cd /path/to/your/project
docker-compose up -d
```

#### 2. Health Checks Failing

**Test health endpoints manually:**
```bash
# Test API health (from within Docker network)
docker exec valx-api curl -f http://localhost:8080/health

# Test MinIO health
docker exec valx-minio curl -f http://localhost:9000/minio/health/live

# Test Jellyfin health
docker exec valx-jellyfin curl -f http://localhost:8096
```

**Common health check failures:**
- **API**: Check if MinIO is accessible at `http://minio:9000`
- **MinIO**: Check if data directory is mounted and writable
- **Jellyfin**: Check if config directory is mounted and writable

#### 3. Coolify Domain Configuration Missing

**In Coolify Dashboard:**
1. Go to your application
2. Navigate to **Domains** section
3. Ensure each service has a domain configured:
   - **API**: `api.val-x.com` → should route to `valx-api` service on port 8080
   - **MinIO**: `minio.val-x.com` → should route to `valx-minio` service on port 9000
   - **Jellyfin**: `play.val-x.com` → should route to `valx-jellyfin` service on port 8096

**Verify domain routing:**
```bash
# From your local machine
curl -I https://api.val-x.com/health
curl -I https://minio.val-x.com/minio/health/live
curl -I https://play.val-x.com
```

#### 4. Network Connectivity Issues

**Check Docker network:**
```bash
docker network inspect valx-network
```

**Verify services can communicate:**
```bash
# From API container, test MinIO connection
docker exec valx-api ping minio
docker exec valx-api curl http://minio:9000/minio/health/live
```

#### 5. Environment Variables Not Set

**Check environment variables in Coolify:**
```bash
# In Coolify dashboard, verify:
# - MINIO_ENDPOINT=http://minio:9000
# - MINIO_ACCESS_KEY=<your-key>
# - MINIO_SECRET_KEY=<your-secret>
# - JWT_SECRET=<your-secret>
# - JELLYFIN_URL=https://play.val-x.com
```

**After updating environment variables:**
```bash
# Restart services
docker-compose restart
# Or in Coolify: Redeploy the application
```

## Jellyfin Server Mismatch Error

### Symptoms
- "Server Mismatch" error when accessing `https://play.val-x.com`
- Jellyfin shows security warning about server identity

### Solution

1. **Update JELLYFIN_URL environment variable:**
   - In Coolify: Go to Environment Variables
   - Set `JELLYFIN_URL=https://play.val-x.com` (NOT `http://localhost:8096`)
   - Save and redeploy

2. **Restart Jellyfin container:**
   ```bash
   docker restart valx-jellyfin
   ```

3. **Clear browser cache:**
   - The error is cached in browser storage
   - Use incognito/private mode or clear site data for `play.val-x.com`

4. **Verify Jellyfin configuration:**
   ```bash
   docker exec valx-jellyfin env | grep JELLYFIN
   # Should show: JELLYFIN_PublishedServerUrl=https://play.val-x.com
   ```

## Service-Specific Issues

### API Service (valx-api)

**Not responding:**
```bash
# Check if API is running
docker ps | grep valx-api

# Check logs
docker logs valx-api --tail 50

# Test internal health endpoint
docker exec valx-api curl http://localhost:8080/health

# Common issues:
# - MinIO connection failed: Check MINIO_ENDPOINT and credentials
# - Port conflict: Check if port 8080 is available
# - Memory issues: Check resource limits
```

**MinIO connection errors:**
```bash
# Verify MinIO is accessible
docker exec valx-api ping minio
docker exec valx-api curl http://minio:9000/minio/health/live

# Check environment variables
docker exec valx-api env | grep MINIO
```

### MinIO Service (valx-minio)

**Not accessible:**
```bash
# Check MinIO status
docker ps | grep valx-minio
docker logs valx-minio --tail 50

# Test health endpoint
docker exec valx-minio curl http://localhost:9000/minio/health/live

# Check data directory
docker exec valx-minio ls -la /data

# Common issues:
# - Data directory not writable: Check volume permissions
# - Wrong credentials: Verify MINIO_ACCESS_KEY and MINIO_SECRET_KEY
```

**Console not accessible:**
- MinIO console is on port 9000, API is on port 9001
- Ensure Coolify routes `minio.val-x.com` to port 9000
- Login with `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`

### Jellyfin Service (valx-jellyfin)

**Not starting:**
```bash
# Check logs
docker logs valx-jellyfin --tail 100

# Check config directory
docker exec valx-jellyfin ls -la /config

# Common issues:
# - Config directory permissions: Ensure PUID/PGID are correct
# - Port conflict: Check if port 8096 is available
# - Memory issues: Jellyfin needs at least 2GB RAM
```

**Server mismatch:**
- See "Jellyfin Server Mismatch Error" section above

## Quick Diagnostics

### Complete Health Check Script

```bash
#!/bin/bash
echo "=== Container Status ==="
docker ps --filter "name=valx" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Network Connectivity ==="
docker network inspect valx-network --format '{{range .Containers}}{{.Name}} {{end}}'

echo -e "\n=== Health Checks ==="
echo "API Health:"
docker exec valx-api curl -s http://localhost:8080/health | jq . || echo "FAILED"

echo -e "\nMinIO Health:"
docker exec valx-minio curl -s http://localhost:9000/minio/health/live || echo "FAILED"

echo -e "\nJellyfin Health:"
docker exec valx-jellyfin curl -s -o /dev/null -w "%{http_code}" http://localhost:8096 || echo "FAILED"

echo -e "\n=== Environment Variables ==="
echo "JELLYFIN_URL:"
docker exec valx-jellyfin env | grep JELLYFIN_URL
```

Save as `check-health.sh`, make executable: `chmod +x check-health.sh`, then run: `./check-health.sh`

## Common Fixes

### Restart All Services
```bash
docker-compose down
docker-compose up -d
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check Resource Usage
```bash
docker stats --no-stream
```

### View All Logs
```bash
docker-compose logs --tail=100 -f
```

## Still Having Issues?

1. **Check Coolify logs** in the dashboard
2. **Verify DNS records** point to your server
3. **Check SSL certificates** are valid in Coolify
4. **Review firewall rules** - ensure ports are accessible
5. **Check disk space** - `df -h`
6. **Review system resources** - `free -h`, `nproc`

## Emergency Recovery

If services are completely down:

```bash
# Stop all services
docker-compose down

# Remove problematic containers (if needed)
docker rm -f valx-api valx-minio valx-jellyfin

# Clean up volumes (WARNING: This deletes data!)
# docker volume rm valx-originals_minio-data valx-originals_jellyfin-config

# Restart from scratch
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

