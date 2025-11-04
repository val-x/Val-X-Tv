# Quick Fix Guide - Production Issues

## Immediate Actions for Current Issues

### Issue: Services showing "Degraded (unhealthy)" or "No available server"

#### Step 1: Check Services Are Running
```bash
# SSH into your server and run:
docker ps | grep valx
```

**If containers are not running:**
```bash
# Restart services
docker-compose -f docker-compose.yml up -d

# Check logs
docker-compose logs --tail=50
```

#### Step 2: Verify Environment Variables in Coolify

**Go to Coolify Dashboard → Your Application → Environment Variables**

**Critical variables to check:**
- ✅ `JELLYFIN_URL=https://play.val-x.com` (NOT localhost!)
- ✅ `MINIO_ENDPOINT=http://minio:9000`
- ✅ `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` are set
- ✅ `JWT_SECRET` is set
- ✅ `CORS_ORIGIN=https://*.val-x.com,https://val-x.com`

**After updating: REDEPLOY the application in Coolify!**

#### Step 3: Verify Domain Configuration in Coolify

**In Coolify Dashboard → Your Application → Domains:**

- ✅ `api.val-x.com` → routes to `valx-api` on port 8080
- ✅ `minio.val-x.com` → routes to `valx-minio` on port 9000
- ✅ `play.val-x.com` → routes to `valx-jellyfin` on port 8096

**If domains are missing, add them and redeploy!**

#### Step 4: Test Health Endpoints

```bash
# From your local machine:
curl -I https://api.val-x.com/health
curl -I https://minio.val-x.com/minio/health/live
curl -I https://play.val-x.com

# From server (if external access fails):
docker exec valx-api curl http://localhost:8080/health
docker exec valx-minio curl http://localhost:9000/minio/health/live
docker exec valx-jellyfin curl http://localhost:8096
```

### Issue: Jellyfin Server Mismatch Error

**Quick Fix:**
1. In Coolify → Environment Variables
2. Set `JELLYFIN_URL=https://play.val-x.com`
3. **Save and REDEPLOY**
4. Clear browser cache or use incognito mode

### Issue: Services Not Accessible

**Checklist:**
1. ✅ Containers are running: `docker ps | grep valx`
2. ✅ Domains configured in Coolify
3. ✅ SSL certificates issued (green lock in Coolify)
4. ✅ DNS records point to your server
5. ✅ Services can communicate internally:
   ```bash
   docker exec valx-api ping minio
   ```

## Emergency Restart

If nothing else works:

```bash
# Stop all services
docker-compose down

# Remove problematic containers (if needed)
docker rm -f valx-api valx-minio valx-jellyfin

# Restart
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

## Still Not Working?

1. **Check Coolify Dashboard** for specific error messages
2. **View service logs** in Coolify for each container
3. **Review** [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed diagnostics
4. **Check** [COOLIFY-SETUP.md](COOLIFY-SETUP.md) for Coolify-specific configuration

## Most Common Issues

1. **Environment variables not set** → Set in Coolify and redeploy
2. **Domains not configured** → Add domains in Coolify UI
3. **Services not redeployed** → Always redeploy after config changes
4. **JELLYFIN_URL wrong** → Must be `https://play.val-x.com`, not localhost
5. **Health checks failing** → Check service logs for errors

