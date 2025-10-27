# How to Fix Jellyfin Bad Gateway in Coolify

## ✅ Container is Working!
Your logs show Jellyfin is running perfectly:
- Server started successfully
- Listening on port 8096
- Startup complete

## 🔧 The Problem
Coolify's Traefik reverse proxy isn't routing to your container. This is a domain configuration issue in Coolify's UI.

## 📝 Exact Steps to Fix

### Method 1: Check Current Domain Settings

1. **In Coolify Dashboard:**
   - Go to your project
   - Click on **Jellyfin** service

2. **Check Domains Tab:**
   - Find `play.val-x.com`
   - Look at the **"Target Port"** value
   - It should say **8096**

3. **If it's wrong or missing:**
   - Click **Edit** or **Add Domain**
   - Set **Domain**: `play.val-x.com`
   - Set **Target Port**: `8096` ← VERY IMPORTANT
   - Ensure **Protocol**: `http`
   - **Save**

### Method 2: Delete and Recreate Domain

If the port is already 8096 but still not working:

1. **Delete the domain:**
   - Find `play.val-x.com` in Domains tab
   - Click **Delete** or **Remove**
   - Wait 30 seconds

2. **Recreate the domain:**
   - Click **Add Domain**
   - Domain: `play.val-x.com`
   - Target Port: `8096`
   - Protocol: `http`
   - Click **Save**

3. **Wait 2 minutes** for Coolify to regenerate Traefik config

## 🔍 Verification

### Check 1: Verify Port in Docker
The container is listening on port 8096 inside the container:
```
[16:11:12] [INF] [11] Main: Kestrel is listening on 0.0.0.0
```

This means Jellyfin is waiting for connections on port 8096 inside the container.

### Check 2: Test Direct Access (if possible)
If you have SSH access to the server:
```bash
curl -I http://localhost:8096
```

Should return: `HTTP/1.1 200 OK`

### Check 3: Check Traefik Labels
In Coolify, the service should have labels like:
- `traefik.http.services.jellyfin.loadbalancer.server.port=8096`

## 🎯 Quick Checklist

Go through this checklist in Coolify:

- [ ] Jellyfin container shows "healthy" status
- [ ] Container logs show "Startup complete"
- [ ] Domain `play.val-x.com` exists in Domains tab
- [ ] Target Port is **exactly** `8096` (not 8097, 8098, etc.)
- [ ] Protocol is set to `http` (not https)
- [ ] SSL is enabled (Coolify handles this)
- [ ] Wait 2 minutes after saving changes

## 🚨 Common Mistakes

❌ **Target Port = 8097 or 8098**
✅ **Target Port = 8096** (must match container port)

❌ **Protocol = https**
✅ **Protocol = http** (Coolify converts to HTTPS)

❌ **Target Port empty or 0**
✅ **Target Port = 8096**

## 💡 Why Port 8096?

Looking at your docker-compose.yml:
```yaml
jellyfin:
  ports:
    - "8096:8096"  # External:Internal
```

- **Left side (8096):** External port on host
- **Right side (8096):** Internal container port

Coolify needs the **INTERNAL** port: `8096`

## 📞 If Still Not Working After All This

1. **Restart the Jellyfin service** in Coolify
2. **Check Traefik logs** in Coolify (if available)
3. **Check if there are multiple domains** conflicting
4. **Try accessing without domain:** `http://your-server-ip:8096`

## ⏰ Expected Timeline

- Save changes: **Now**
- Wait for Traefik: **1-2 minutes**
- Test: **https://play.val-x.com/**

---

**Your container is working perfectly. Just need to fix the Coolify domain configuration!** 🎯

