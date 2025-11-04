# Health Check Fix

## Issue

API container shows "Unhealthy" status in Coolify because the health check uses `curl`, which isn't available in the Bun container image.

## Solution

Updated `functions/Dockerfile` to install `curl` for health checks:

```dockerfile
RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*
```

## What This Means

- **Before**: Health check failed because `curl` wasn't found
- **After**: Health check will work after rebuilding the container

## Action Required

1. **Rebuild the API container** in Coolify:
   - Go to Coolify Dashboard → Your Application
   - Click "Rebuild" or "Redeploy"
   - This will rebuild with the updated Dockerfile that includes `curl`

2. **Wait for rebuild** to complete (2-5 minutes)

3. **Verify health check**:
   - Container should show "Healthy" status
   - Health check will properly test `/health` endpoint

## About "Unhealthy" Status

As Coolify explains:
- "Unhealthy" doesn't mean the service is broken
- It just means the health check isn't configured or is failing
- If the service is accessible, it's working fine
- But fixing the health check helps with monitoring and auto-recovery

## Benefits of Working Health Check

- ✅ Better monitoring in Coolify dashboard
- ✅ Automatic restart if service becomes unhealthy
- ✅ Clear status indication
- ✅ Helps with debugging

## Status After Fix

After rebuilding:
- ✅ API container will show "Healthy" status
- ✅ Health endpoint `/health` will be properly monitored
- ✅ Coolify will automatically restart if service fails

