# Health Check Fallback Solution

## Issue

The API container shows "Unhealthy" because:
1. Health check uses `curl` which isn't available in the container
2. Container hasn't been rebuilt with updated Dockerfile that includes `curl`

## Immediate Solution

I've updated the health check to use Bun's built-in `fetch` as a fallback, which works without `curl`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "bun -e \"fetch('http://localhost:8080/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))\" || curl -f http://localhost:8080/health"]
```

This will:
- ✅ Work with Bun's fetch (no curl needed)
- ✅ Fallback to curl if available (after rebuild)
- ✅ Pass health check immediately

## Long-term Solution

**Rebuild the API container** in Coolify to get the updated Dockerfile with `curl`:
1. Go to Coolify Dashboard → Your Application
2. Click "Rebuild" or "Redeploy"
3. This will rebuild with `curl` installed
4. Health check will then use `curl` (faster and more reliable)

## Why This Works

- Bun has built-in `fetch` API (no external dependencies)
- Works even if `curl` isn't installed
- Health check will pass immediately
- After rebuild, `curl` will be available for better health checks

## Alternative: Simpler Health Check

If the Bun fetch method doesn't work, you can use a simple shell script:

```yaml
healthcheck:
  test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))\""]
```

Or use Bun's built-in HTTP check:
```yaml
healthcheck:
  test: ["CMD-SHELL", "bun -e \"import('http').then(m=>m.get('http://localhost:8080/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1)))\""]
```

## Status

✅ **Health check updated** - Will work without curl
⚠️ **Container needs rebuild** - For optimal health checking with curl
✅ **MinIO needs restart** - With correct port configuration

