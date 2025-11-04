# Coolify Deployment Setup Guide

## Critical Configuration Steps

### 1. Service Discovery in Coolify

Coolify uses Traefik for routing, but you need to configure domains in the Coolify UI, not just in docker-compose labels.

**Steps:**
1. In Coolify dashboard, go to your application
2. For EACH service (API, MinIO, Jellyfin), you need to:
   - Add a domain/subdomain
   - Map it to the correct service container
   - Ensure the port matches

### 2. Configure Domains in Coolify

#### API Service (valx-api)
1. Go to your Coolify application
2. Click on **"Add Domain"** or **"Domains"**
3. Add domain: `api.val-x.com`
4. Ensure it routes to: `valx-api` container
5. Port: `8080`
6. Enable HTTPS (Let's Encrypt)

#### MinIO Service (valx-minio)
1. Add domain: `minio.val-x.com`
2. Route to: `valx-minio` container
3. Port: `9000` (console) or `9001` (API)
4. Enable HTTPS

#### Jellyfin Service (valx-jellyfin)
1. Add domain: `play.val-x.com`
2. Route to: `valx-jellyfin` container
3. Port: `8096`
4. Enable HTTPS

**Important:** If you're using a single docker-compose file, Coolify should automatically discover all services. If not, you may need to create separate applications for each service.

### 3. Environment Variables

**Set in Coolify Dashboard → Environment Variables:**

```env
# Required
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=<your-secure-key>
MINIO_SECRET_KEY=<your-secure-secret>
JWT_SECRET=<your-strong-secret>
PORT=8080

# Critical for Jellyfin
JELLYFIN_URL=https://play.val-x.com

# CORS Configuration
CORS_ORIGIN=https://*.val-x.com,https://val-x.com
```

**After setting environment variables:**
- Save changes
- **Redeploy the application** (this is critical!)

### 4. Verify Service Health

After deployment, check service health:

```bash
# In Coolify dashboard, check:
# 1. All containers are running (green status)
# 2. Health checks are passing
# 3. Domains are properly configured

# Or via SSH:
docker ps | grep valx
# Should show all three containers running
```

### 5. Common Issues and Fixes

#### Issue: "No available server" in Coolify

**Cause:** Services not running or health checks failing

**Fix:**
1. Check container logs in Coolify dashboard
2. Verify environment variables are set
3. Check if services can start (check logs for errors)
4. Restart services: In Coolify → Restart Application

#### Issue: Services showing "Degraded (unhealthy)"

**Cause:** Health checks are failing

**Fix:**
1. Check health endpoint manually:
   ```bash
   docker exec valx-api curl http://localhost:8080/health
   ```
2. Verify dependencies are running:
   - API depends on MinIO - ensure MinIO is running
3. Check resource limits - services might be out of memory
4. Review health check configuration in docker-compose.yml

#### Issue: Domains not resolving

**Cause:** DNS not configured or Coolify domain routing not set up

**Fix:**
1. Verify DNS records point to your server:
   ```bash
   dig api.val-x.com
   dig minio.val-x.com
   dig play.val-x.com
   ```
2. In Coolify, ensure domains are added and enabled
3. Check SSL certificates are issued (Let's Encrypt)
4. Verify Traefik is running: `docker ps | grep traefik`

#### Issue: Jellyfin Server Mismatch

**Cause:** `JELLYFIN_URL` environment variable not set correctly

**Fix:**
1. Set `JELLYFIN_URL=https://play.val-x.com` in Coolify
2. Redeploy Jellyfin service
3. Clear browser cache

### 6. Service Startup Order

Services should start in this order:
1. **MinIO** (no dependencies)
2. **API** (depends on MinIO)
3. **Jellyfin** (independent)

The `depends_on` in docker-compose.yml handles this automatically, but if services fail to start, check MinIO first.

### 7. Network Configuration

All services must be on the same Docker network (`valx-network`). Coolify should handle this automatically, but verify:

```bash
docker network inspect valx-network
```

All containers should be listed in the network.

### 8. Port Configuration

**Important:** The root `docker-compose.yml` uses `expose` (not `ports`) because Coolify's Traefik handles routing. This is correct.

**Do NOT change to `ports`** unless you're running without Coolify (local development).

### 9. Health Check Configuration

Health checks are configured in docker-compose.yml. If services show as unhealthy:

1. **Check if health check command works:**
   ```bash
   # Test API health check
   docker exec valx-api curl -f http://localhost:8080/health
   
   # Test MinIO health check
   docker exec valx-minio curl -f http://localhost:9000/minio/health/live
   
   # Test Jellyfin health check
   docker exec valx-jellyfin curl -f http://localhost:8096
   ```

2. **If health checks fail:**
   - Service might not be fully started (increase `start_period`)
   - Check service logs for errors
   - Verify service is listening on expected port

### 10. Redeployment After Configuration Changes

**After ANY configuration change:**
1. Save changes in Coolify
2. Click **"Redeploy"** or **"Restart"**
3. Wait for services to start (check logs)
4. Verify health status in dashboard

**Never skip redeployment** - environment variable changes require container restart.

## Quick Verification Checklist

After deployment, verify:

- [ ] All containers show as "Running" in Coolify
- [ ] All health checks show as "Healthy"
- [ ] Domains are configured in Coolify for each service
- [ ] SSL certificates are issued (green lock icon)
- [ ] `JELLYFIN_URL` is set to `https://play.val-x.com`
- [ ] Can access `https://api.val-x.com/health`
- [ ] Can access `https://minio.val-x.com` (MinIO console)
- [ ] Can access `https://play.val-x.com` (Jellyfin, no server mismatch)
- [ ] Services can communicate internally (check logs for connection errors)

## Emergency Recovery

If everything is down:

1. **Check Coolify dashboard** - see what's failing
2. **View logs** in Coolify for each service
3. **SSH into server** and run diagnostics:
   ```bash
   docker ps -a
   docker logs valx-api
   docker logs valx-minio
   docker logs valx-jellyfin
   ```
4. **Restart services** via Coolify dashboard
5. **If needed, rebuild:**
   ```bash
   # In Coolify: Rebuild Application
   # Or via SSH:
   docker-compose down
   docker-compose up -d --build
   ```

## Support

If issues persist:
1. Check `TROUBLESHOOTING.md` for detailed diagnostics
2. Review logs in Coolify dashboard
3. Verify all configuration steps above
4. Check Coolify documentation for Traefik routing

