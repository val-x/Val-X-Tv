# Routing Issues - "No Available Server" Troubleshooting

## Symptoms

- `https://api.val-x.com/` shows "no available server"
- `https://minio.val-x.com:9001/` shows "took too long to respond"

## Root Cause

Services are running, but Coolify/Traefik routing is not properly configured. The containers exist but domains aren't routing to them.

## Services Status

Containers are running:
- ✅ API: `valx-api-*` (Up, but unhealthy)
- ✅ MinIO: `minio-*` (Up, healthy)
- ✅ Jellyfin: `jellyfin-*` (Up, healthy)
- ✅ Coolify Proxy: Running

## Solution: Configure Domains in Coolify

### Step 1: Add Domains for Each Service

In Coolify Dashboard → Your Application → Domains:

1. **API Domain** (`api.val-x.com`):
   - Add domain: `api.val-x.com`
   - Route to: `valx-api` service
   - Port: `8080`
   - Enable HTTPS (Let's Encrypt)

2. **MinIO Console Domain** (`minio.val-x.com`):
   - Add domain: `minio.val-x.com`
   - Route to: `minio` service
   - Port: `9001` (console port)
   - Enable HTTPS (Let's Encrypt)
   - **Note**: Console is on port 9001, API is on 9000

3. **Jellyfin Domain** (`play.val-x.com`):
   - Add domain: `play.val-x.com`
   - Route to: `jellyfin` service
   - Port: `8096`
   - Enable HTTPS (Let's Encrypt)

### Step 2: Verify Domain Configuration

After adding domains:
1. **Save** domain configuration
2. **Redeploy** the application
3. Wait for SSL certificates to be issued (Let's Encrypt)
4. Test domains:
   ```bash
   curl -I https://api.val-x.com/health
   curl -I https://minio.val-x.com
   curl -I https://play.val-x.com
   ```

### Step 3: Check DNS Records

Ensure DNS records point to your server:
```bash
dig api.val-x.com
dig minio.val-x.com
dig play.val-x.com
```

All should resolve to your server's IP address.

## Port Configuration

### MinIO Ports
- **API/Storage**: Port `9000` (for API access)
- **Console/WebUI**: Port `9001` (for web console)

### Access URLs
- **MinIO Console**: `https://minio.val-x.com` (routes to port 9001)
- **MinIO API**: Internal only via `http://minio:9000` (Docker network)

### Common Mistake
❌ Don't use: `https://minio.val-x.com:9001/`
✅ Use: `https://minio.val-x.com/` (Coolify routes to correct port)

## Troubleshooting Steps

### 1. Check Container Status
```bash
docker ps | grep -E 'valx|minio|jellyfin'
```

All should show "Up" status.

### 2. Check Internal Connectivity
```bash
# From API container
docker exec <api-container> getent hosts minio

# From host
docker exec <api-container> curl http://minio:9000/minio/health/live
```

### 3. Check Coolify Proxy Logs
```bash
docker logs coolify-proxy --tail 50
```

Look for routing errors or domain resolution issues.

### 4. Verify Domain Configuration

In Coolify Dashboard:
- Go to your application
- Check "Domains" section
- Verify each service has a domain configured
- Verify domains are enabled (not disabled)
- Verify SSL certificates are issued (green lock icon)

### 5. Test Health Endpoints

From server (internal):
```bash
# API health
curl http://localhost:8080/health

# MinIO health
curl http://localhost:9000/minio/health/live

# Jellyfin
curl http://localhost:8096
```

### 6. Check Network Connectivity

All containers must be on the same Docker network:
```bash
docker network inspect <network-name> | grep -A 5 Containers
```

## Quick Fix Checklist

- [ ] Domains configured in Coolify UI for each service
- [ ] Domains enabled (not disabled)
- [ ] SSL certificates issued (Let's Encrypt)
- [ ] DNS records point to server IP
- [ ] Application redeployed after domain configuration
- [ ] Containers are running and healthy
- [ ] Ports match service configuration (API: 8080, MinIO Console: 9001, Jellyfin: 8096)

## Still Not Working?

1. **Check Coolify logs** in dashboard for specific errors
2. **Verify Traefik/Coolify proxy** is running: `docker ps | grep proxy`
3. **Check firewall** - ensure ports 80/443 are open
4. **Review** [COOLIFY-SETUP.md](COOLIFY-SETUP.md) for detailed setup steps
5. **Check** [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more diagnostics

## Expected Behavior After Fix

✅ `https://api.val-x.com/health` returns JSON health status
✅ `https://minio.val-x.com` shows MinIO login page
✅ `https://play.val-x.com` shows Jellyfin interface (no server mismatch)

