# Immediate Fixes Required

## Current Issues

### 1. API Container: "Unhealthy" Status
**Problem:** Health check fails because `curl` is not available in container

**Solution Applied:**
- ✅ Updated health check to use Bun's `fetch` (works without curl)
- ⚠️ **Action Required**: Rebuild API container in Coolify to get updated health check

**Quick Fix:**
1. Go to Coolify Dashboard → Your Application
2. Click "Redeploy" or "Rebuild"
3. This will apply the new health check that works with Bun's fetch

### 2. MinIO Container: Restarting Continuously
**Problem:** MinIO is using old command: `--console-address ":9000"` (same as API port)

**Root Cause:** Container was created with old docker-compose.yml configuration

**Solution:**
The docker-compose.yml has been fixed with:
```yaml
command: server /data --address ":9000" --console-address ":9001"
```

**Action Required:**
1. **In Coolify Dashboard:**
   - Go to your application
   - Click "Redeploy" or "Rebuild"
   - This will recreate MinIO with correct command

2. **Or manually fix (if needed):**
   ```bash
   # Stop and remove old MinIO
   docker stop <minio-container-name>
   docker rm <minio-container-name>
   # Coolify will recreate it with correct config on next deploy
   ```

## Summary of Fixes

### Code Changes (Already Committed)
- ✅ Fixed MinIO command in docker-compose.yml
- ✅ Added curl to Dockerfile (needs rebuild)
- ✅ Updated health check to use Bun fetch (works immediately)

### Deployment Actions Required
1. **Rebuild API container** - For updated health check
2. **Redeploy MinIO** - To get correct port configuration
3. **Verify domains** - Ensure `api.val-x.com` and `minio.val-x.com` are configured

## After Rebuild

Expected status:
- ✅ API: Healthy (health check working)
- ✅ MinIO: Running (ports 9000/9001 correctly configured)
- ✅ Jellyfin: Healthy (already working)

## Verification

After redeploy, check:
```bash
docker ps | grep -E 'valx-api|minio|jellyfin'
# All should show "Up" and "healthy" status

curl https://api.val-x.com/health
# Should return JSON with status: "ok"
```

