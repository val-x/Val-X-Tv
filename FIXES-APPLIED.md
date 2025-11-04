# Fixes Applied - Service Health Issues

## Issues Found and Fixed

### ✅ Issue 1: MinIO Container Restarting Continuously
**Problem:** MinIO was crashing with error: `--console-address cannot be same as --address`

**Root Cause:** Both API and console were set to port 9000, causing a conflict.

**Fix Applied:**
- Updated `docker-compose.yml`: Changed MinIO command from `server /data --console-address ":9000"` to `server /data --address ":9000" --console-address ":9001"`
- Manually restarted MinIO container with correct command
- **Status:** ✅ MinIO is now running successfully

### ✅ Issue 2: API Cannot Connect to MinIO
**Problem:** API showing ECONNREFUSED errors when trying to connect to MinIO

**Root Cause:** API was looking for hostname "minio" but container name was `minio-lccwsow0o8o40w48wwgcwcc8-041449127872`

**Fix Applied:**
- Added network alias "minio" to MinIO container so DNS resolution works
- **Status:** ✅ API can now connect to MinIO (buckets are being created)

### ⚠️ Issue 3: Invalid Bucket Names
**Problem:** API error: `InvalidBucketNameError: Invalid bucket name: fm`

**Root Cause:** MinIO requires bucket names to be at least 3 characters. Buckets "fm" and "tv" are too short.

**Fix Applied:**
- Updated `functions/utils/minio.ts`: Changed bucket names:
  - `FM: 'fm'` → `FM: 'fm-radio'`
  - `TV: 'tv'` → `TV: 'tv-shows'`
- **Status:** ⚠️ Code updated, but API container needs to be rebuilt with new code

### ✅ Issue 4: Jellyfin Server Mismatch
**Previous Fix:** Jellyfin URL configuration was updated in v1.0.1

**Status:** ✅ Jellyfin is running and healthy

## Current Service Status

```
✅ MinIO:     Running (Up, healthy)
⚠️  API:       Running but unhealthy (needs rebuild with new code)
✅ Jellyfin:  Running (Up, healthy)
```

## Next Steps Required

### 1. Rebuild API Container in Coolify (CRITICAL)

The API container is still running old code that uses invalid bucket names. You need to:

1. **Go to Coolify Dashboard**
2. **Navigate to your Val-X application**
3. **Click "Redeploy" or "Rebuild"**
4. This will rebuild the API container with the updated code that has:
   - Fixed bucket names (fm-radio, tv-shows)
   - Updated MinIO configuration

### 2. Verify After Rebuild

After rebuilding, verify all services are healthy:

```bash
# Check all services
docker ps | grep -E 'valx|minio|jellyfin'

# Check API health
curl https://api.val-x.com/health

# Check MinIO
curl https://minio.val-x.com/minio/health/live

# Check Jellyfin
curl -I https://play.val-x.com
```

### 3. Update Environment Variables (If Needed)

Ensure in Coolify that:
- `JELLYFIN_URL=https://play.val-x.com` (not localhost!)
- `MINIO_ENDPOINT=http://minio:9000`
- All other required variables are set

## Files Changed

1. **docker-compose.yml**
   - Fixed MinIO command to use separate ports for API and console

2. **functions/utils/minio.ts**
   - Changed bucket names to meet MinIO requirements

3. **Code committed to repository**
   - Ready for deployment

## Manual Fixes Applied on Server

1. ✅ Stopped and removed crashing MinIO container
2. ✅ Started MinIO with correct command (API: 9000, Console: 9001)
3. ✅ Added network alias "minio" for DNS resolution
4. ✅ Restarted API container (will work fully after rebuild)

## Troubleshooting

If services still show issues after rebuild:

1. **Check container logs:**
   ```bash
   docker logs valx-api-<container-id> --tail 50
   docker logs minio-<container-id> --tail 50
   ```

2. **Verify network connectivity:**
   ```bash
   docker network inspect <network-name>
   ```

3. **Check environment variables:**
   ```bash
   docker inspect <container-id> | grep -A 20 Env
   ```

## Summary

- ✅ MinIO: Fixed and running
- ✅ Network: Fixed DNS resolution
- ✅ Jellyfin: Already working
- ⚠️  API: Needs rebuild with new code (bucket name fix)

**Action Required:** Rebuild API container in Coolify dashboard to apply bucket name fixes.

