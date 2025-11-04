# MinIO Routing Fix - Connection Timeout

## Issue

`minio.val-x.com` shows "ERR_CONNECTION_TIMED_OUT" - the domain is not routing to the MinIO container.

## Root Cause

The domain `minio.val-x.com` is not configured in Coolify, or the routing is not properly set up.

## Solution: Configure MinIO Domain in Coolify

### Step 1: Add Domain in Coolify Dashboard

1. **Go to Coolify Dashboard**
2. **Navigate to your Val-X application**
3. **Go to "Domains" or "Configuration" → "Domains"**
4. **Click "+ Add Domain" or "Add"**

### Step 2: Configure MinIO Domain

**Domain Configuration:**
- **Domain**: `minio.val-x.com`
- **Service**: Select `minio` service (or the MinIO container)
- **Port**: `9001` (MinIO Console/WebUI port)
- **Enable HTTPS**: Yes (Let's Encrypt)
- **Path**: `/` (root path)

### Step 3: Verify Port Configuration

**MinIO Ports:**
- **Port 9000**: API/Storage (internal use, not for web access)
- **Port 9001**: Console/WebUI (this is what you access via browser)

**Important**: 
- Use port `9001` for the domain routing
- Don't include port in URL: Use `https://minio.val-x.com/` (not `:9001`)

### Step 4: Save and Redeploy

1. **Save** the domain configuration
2. **Redeploy** the application (if needed)
3. **Wait** for SSL certificate to be issued (2-5 minutes)
4. **Test**: `https://minio.val-x.com/`

## Current Status

✅ **MinIO Container**: Running and healthy
✅ **MinIO Service**: Working on ports 9000 (API) and 9001 (Console)
❌ **Domain Routing**: Not configured (needs to be added in Coolify)

## Troubleshooting

### If Domain Still Doesn't Work

1. **Check DNS Records**:
   ```bash
   dig minio.val-x.com
   ```
   Should resolve to your server's IP address.

2. **Check SSL Certificate**:
   - In Coolify, verify SSL certificate is issued (green lock icon)
   - If not, wait a few minutes for Let's Encrypt to issue

3. **Check Port Configuration**:
   - Verify domain is routed to port `9001` (not 9000)
   - Port 9000 is for API, 9001 is for web console

4. **Check Container Network**:
   ```bash
   docker network inspect <network-name> | grep minio
   ```
   MinIO container should be in the same network as Coolify proxy.

5. **Check Coolify Proxy Logs**:
   ```bash
   docker logs coolify-proxy --tail 50 | grep minio
   ```
   Look for routing errors or port configuration issues.

### Common Mistakes

❌ **Wrong Port**: Using port 9000 instead of 9001
❌ **Port in URL**: Using `https://minio.val-x.com:9001/` (should be without port)
❌ **Domain Not Saved**: Domain added but not saved
❌ **SSL Not Issued**: Waiting for Let's Encrypt certificate

✅ **Correct Configuration**:
- Domain: `minio.val-x.com`
- Port: `9001`
- URL: `https://minio.val-x.com/` (no port number)

## Expected Result

After configuration:
- ✅ `https://minio.val-x.com/` shows MinIO login page
- ✅ Can login with `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`
- ✅ Can access MinIO console and manage buckets

## Verification

Test from your browser:
1. Go to `https://minio.val-x.com/`
2. Should see MinIO login page
3. Login with credentials from environment variables:
   - Username: Value of `MINIO_ACCESS_KEY`
   - Password: Value of `MINIO_SECRET_KEY`

## Related Documentation

- [ROUTING-ISSUES.md](ROUTING-ISSUES.md) - General routing troubleshooting
- [COOLIFY-SETUP.md](COOLIFY-SETUP.md) - Coolify configuration guide

