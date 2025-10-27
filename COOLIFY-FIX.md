# Coolify Deployment Fixes - Val-X TV/FM

## 🐛 Current Issues

### ❌ Jellyfin: Bad Gateway at https://play.val-x.com
### ❌ AzuraCast: No Available Server at https://fm.val-x.com  
### ✅ ErsatzTV: Working but Hardware Acceleration needs configuration

## 🔧 Fix Instructions

### Step 1: Configure Coolify Domain Ports

In Coolify, you need to ensure the domain configurations are set to route to the **internal container ports**, not the external ports.

#### For Jellyfin (https://play.val-x.com)
1. Go to Coolify → Your Project → Jellyfin service
2. Navigate to **Domains** tab
3. Edit `play.val-x.com` domain
4. Verify settings:
   - **Target Port:** `8096` (internal container port)
   - **Protocol:** `http` (not https for internal)
   - **SSL:** Enabled
5. Save and wait for Coolify to regenerate proxy config

#### For AzuraCast (https://fm.val-x.com)
1. Go to Coolify → Your Project → AzuraCast service
2. Navigate to **Domains** tab
3. Edit `fm.val-x.com` domain
4. Verify settings:
   - **Target Port:** `8080` (internal container port, NOT 8081)
   - **Protocol:** `http`
   - **SSL:** Enabled
5. Save and wait for Coolify to regenerate proxy config

### Step 2: Configure Hardware Acceleration in ErsatzTV

After the container restarts with the new `docker-compose.yml`:

1. **Access ErsatzTV:** https://tv.val-x.com
2. **Go to Settings → FFmpeg Profiles**
3. **Edit the profile used by "Val-X TV" channel**
4. **Change the video encoder:**
   - For **Intel GPU**: Use `libx264` with VAAPI acceleration
   - For **AMD GPU**: Use `libx264` with VAAPI acceleration  
   - For **NVIDIA GPU**: Use `h264_nvenc`

**Example VAAPI configuration:**
```
-vf "format=nv12|vaapi,hwupload,scale_vaapi=w=1920:h=1080"
```

**Example NVIDIA configuration:**
```
-c:v h264_nvenc -preset fast
```

5. **Save the profile**
6. **Health checks should now pass** ✅

### Step 3: Wait for Services to Initialize

Both Jellyfin and AzuraCast take 2-5 minutes to fully initialize:

1. Check Coolify logs for each service
2. Look for "ready" or "initialized" messages
3. Wait for health checks to pass
4. Services should become available

### Step 4: Test Each Service

#### Test ErsatzTV
1. Visit: https://tv.val-x.com
2. Check Health Checks → Hardware Acceleration should pass
3. Channels should be streaming

#### Test Jellyfin
1. Visit: https://play.val-x.com
2. Should show setup wizard or login screen
3. If Bad Gateway persists, check Coolify logs

#### Test AzuraCast
1. Visit: https://fm.val-x.com
2. Should show AzuraCast login or setup
3. If "No Available Server" persists, verify target port is 8080

## 🔍 Troubleshooting

### Jellyfin Still Shows Bad Gateway

**Possible causes:**
- Target port in Coolify is wrong (should be 8096)
- Container is still initializing (wait 3-5 minutes)
- Health check is failing

**Fix:**
1. Check Coolify logs for Jellyfin container
2. Verify container is "healthy" in status
3. Restart Jellyfin service in Coolify
4. Ensure target port is 8096

### AzuraCast Still Shows "No Available Server"

**Possible causes:**
- Target port is set to 8081 instead of 8080
- Container is still initializing
- Traefik routing issue

**Fix:**
1. In Coolify, check domain configuration
2. Target port MUST be 8080 (internal container port)
3. Wait 2-5 minutes for full initialization
4. Check container logs for database initialization messages
5. Restart service if needed

### Hardware Acceleration Warning Persists

**Check in ErsatzTV:**
1. Go to Settings → FFmpeg Profiles
2. Find the profile used by "Val-X TV" channel
3. Check if encoder uses hardware acceleration
4. Update encoder to use VAAPI (Intel/AMD) or NVENC (NVIDIA)

**If you don't have a GPU:**
- Use CPU encoding (software encoding)
- Accept the warning, it won't affect functionality
- Disable hardware acceleration check in settings

## 📊 Port Reference

| Service   | External Port | Internal Port | Coolify Target Port |
|-----------|--------------|--------------|-------------------|
| ErsatzTV  | 8409         | 8409         | 8409              |
| AzuraCast | 8081         | 8080         | **8080** (important) |
| Jellyfin  | 8096         | 8096         | 8096              |

⚠️ **Critical:** In Coolify, always use the **internal container port** as the target port!

## ✅ Verification Checklist

After deploying updated `docker-compose.yml`:

- [ ] Push changes to repository
- [ ] Coolify auto-redeploys (or manually redeploy)
- [ ] Wait 5 minutes for all services to initialize
- [ ] Check ErsatzTV health checks → Hardware Acceleration passes
- [ ] Configure FFmpeg profiles in ErsatzTV to use hardware acceleration
- [ ] Verify Jellyfin target port is 8096 in Coolify
- [ ] Verify AzuraCast target port is 8080 in Coolify
- [ ] Test each service URL
- [ ] All services accessible ✅

## 🚀 Quick Commands

```bash
# Check if hardware acceleration is enabled
ls -l /dev/dri/

# Test if containers can access GPU
docker exec val-x-tv ls -l /dev/dri/
docker exec jellyfin-val-x ls -l /dev/dri/

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# View logs
docker logs val-x-tv
docker logs val-x-fm
docker logs jellyfin-val-x
```

## 📝 Next Steps

1. **Redeploy** with the updated `docker-compose.yml`
2. **Verify** ports in Coolify are correct
3. **Wait** 5 minutes for initialization
4. **Configure** hardware acceleration in ErsatzTV web UI
5. **Test** all three services
6. **Enjoy** your optimized streaming setup! 🎉

