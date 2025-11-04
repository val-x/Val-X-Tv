# MinIO Port Configuration - Latest Documentation

## MinIO Ports Explained

Based on MinIO latest documentation and help output:

### Port 9000: API/Storage Server
- **Purpose**: Object storage API endpoints (S3-compatible)
- **Flag**: `--address ":9000"` (default)
- **Usage**: Used by applications to store/retrieve objects
- **Example**: `http://minio:9000` (internal) or `https://api.minio.example.com` (via reverse proxy)

### Port 9001: Console/WebUI
- **Purpose**: Embedded Web Console for management
- **Flag**: `--console-address ":9001"`
- **Usage**: Browser-based UI for managing buckets, users, policies
- **Example**: `http://localhost:9001` (direct) or `https://minio.example.com` (via reverse proxy)

## Current Configuration

Our `docker-compose.yml` correctly configures:

```yaml
command: server /data --address ":9000" --console-address ":9001"
```

This means:
- ✅ API/Storage is on port 9000
- ✅ Console/WebUI is on port 9001

## Reverse Proxy Configuration

### For Coolify/Traefik

When configuring domains in Coolify:

**MinIO Console Domain** (`minio.val-x.com`):
- **Port**: `9001` (Console/WebUI)
- **URL**: `https://minio.val-x.com/` (no port number)
- **Purpose**: Access MinIO web console

**MinIO API Domain** (if needed separately):
- **Port**: `9000` (API/Storage)
- **URL**: `https://api-minio.val-x.com/` (if exposing API publicly)
- **Purpose**: S3-compatible API access

**Note**: Typically, only the Console (port 9001) is exposed publicly. The API (port 9000) is accessed internally via Docker network.

## Internal Access

For services within Docker network:
- **API**: `http://minio:9000` (used by `MINIO_ENDPOINT`)
- **Console**: `http://minio:9001` (internal console access)

## Health Check

The health check correctly uses port 9000 (API):
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
```

This is correct because:
- Health endpoint is on the API server (port 9000)
- Console doesn't have a health endpoint

## Verification

Check MinIO logs to confirm ports:
```bash
docker logs <minio-container> | grep -E "API:|WebUI:|Console"
```

Should show:
```
API: http://127.0.0.1:9000
WebUI: http://127.0.0.1:9001
```

## Common Mistakes

❌ **Wrong Port for Console**: Routing `minio.val-x.com` to port 9000 (should be 9001)
❌ **Wrong Port for API**: Using port 9001 for API access (should be 9000)
❌ **Incorrect Comment**: Saying "9000 is console" (it's actually API)

✅ **Correct**: 
- Port 9000 = API/Storage
- Port 9001 = Console/WebUI

## Documentation References

- MinIO Server Help: `minio server --help`
- MinIO Version: RELEASE.2025-09-07T16-13-09Z
- Latest docs: https://github.com/minio/docs (build locally)

## Summary

Our configuration is correct:
- API on port 9000 ✅
- Console on port 9001 ✅
- Health check uses port 9000 ✅
- For Coolify domain routing, use port 9001 for console access ✅

