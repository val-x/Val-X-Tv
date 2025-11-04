# Emergency Fix - Services Not Running

## Current Situation

Based on your `docker ps` output, only the API container is running (and it's unhealthy). MinIO and Jellyfin are **not running at all**.

## Root Cause

The API depends on MinIO (`depends_on: minio`), so if MinIO isn't running, the API will be unhealthy even if it starts.

## Immediate Fix Steps

### Option 1: Fix via Coolify Dashboard (Recommended)

1. **Go to Coolify Dashboard**
2. **Check your application** - Look for all three services:
   - `valx-api`
   - `valx-minio` 
   - `valx-jellyfin`

3. **If services are missing:**
   - Coolify might only be deploying the API service
   - You may need to configure Coolify to deploy all services from docker-compose.yml
   - OR create separate applications for each service

4. **If services exist but aren't running:**
   - Check logs in Coolify dashboard for each service
   - Look for startup errors
   - Restart failed services

### Option 2: Manual Fix via SSH

**SSH into your server and run:**

```bash
# 1. Navigate to your project directory (where docker-compose.yml is)
cd /path/to/your/project

# 2. Check what's defined in docker-compose.yml
cat docker-compose.yml | grep -A 2 "container_name:"

# 3. Start all services
docker-compose up -d

# 4. Check status
docker ps | grep valx

# 5. If MinIO and Jellyfin still don't start, check logs:
docker-compose logs minio
docker-compose logs jellyfin
```

### Option 3: Start Services Individually

If docker-compose doesn't work, try starting services one by one:

```bash
# Start MinIO first (API depends on it)
docker-compose up -d minio

# Wait a few seconds, then check MinIO is running
docker ps | grep minio

# Start Jellyfin
docker-compose up -d jellyfin

# Restart API (so it can connect to MinIO)
docker-compose restart valx-api

# Check all services
docker ps | grep valx
```

## Diagnose the Issue

**Run the diagnostic script:**

```bash
# Copy the diagnostic script to your server, then:
chmod +x DIAGNOSTIC-SCRIPT.sh
./DIAGNOSTIC-SCRIPT.sh
```

**Or manually check:**

```bash
# 1. Check if containers exist but stopped
docker ps -a | grep valx

# 2. Check API logs (why it's unhealthy)
docker logs valx-api-lccwsow0o8o40w48wwgcwcc8-041449109018 --tail 50

# 3. Check if MinIO container exists
docker ps -a | grep minio

# 4. Check if Jellyfin container exists  
docker ps -a | grep jellyfin

# 5. Check docker-compose status
docker-compose ps
```

## Common Issues

### Issue: Coolify Only Deploys API Service

**Cause:** Coolify might be configured to only deploy the main service, not all services in docker-compose.yml

**Fix:**
1. In Coolify, check if you need to enable "Deploy all services" option
2. OR create separate applications for each service:
   - Application 1: API (docker-compose.yml with only valx-api)
   - Application 2: MinIO (docker-compose.yml with only minio)
   - Application 3: Jellyfin (docker-compose.yml with only jellyfin)

### Issue: Services Fail to Start

**Check logs for errors:**
```bash
docker logs valx-minio --tail 50
docker logs valx-jellyfin --tail 50
```

**Common errors:**
- **Volume permissions**: Check if data directories are writable
- **Port conflicts**: Check if ports 9000, 9001, 8096 are available
- **Memory issues**: Check available memory: `free -h`
- **Network issues**: Check if `valx-network` exists: `docker network ls`

### Issue: API Can't Connect to MinIO

**If MinIO is running but API can't connect:**

```bash
# Test connectivity from API container
docker exec valx-api ping minio

# Check network
docker network inspect valx-network

# Verify MinIO is accessible
docker exec valx-api curl http://minio:9000/minio/health/live
```

## Verify Fix

After starting services:

```bash
# All three should show as "Up"
docker ps | grep valx

# Test health endpoints
docker exec valx-api curl http://localhost:8080/health
docker exec valx-minio curl http://localhost:9000/minio/health/live
docker exec valx-jellyfin curl http://localhost:8096
```

## Still Not Working?

1. **Check Coolify logs** in dashboard for deployment errors
2. **Verify docker-compose.yml** is in the correct location
3. **Check Coolify configuration** - ensure it's using the right compose file
4. **Review** [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed diagnostics

