# Fix Jellyfin Bad Gateway - Step by Step

## 🔍 Issue
Jellyfin shows "Bad Gateway" at https://play.val-x.com/

## ⚡ Quick Fix (2 minutes)

### Step 1: Access Coolify
1. Login to your Coolify dashboard
2. Navigate to your project
3. Click on the **Jellyfin** service (jellyfin-val-x)

### Step 2: Check Domain Configuration
1. Go to the **"Domains"** tab in Jellyfin service
2. Look for `play.val-x.com`
3. Click **Edit** on the domain

### Step 3: Verify Target Port
**Critical:** Make sure the target port is set to **8096** (NOT 8097 or other)

Correct configuration:
- **Domain:** `play.val-x.com`
- **Target Port:** `8096` ← This is the internal container port
- **Protocol:** `http` (Coolify handles HTTPS)
- **SSL:** Enabled ✓

### Step 4: Save and Wait
1. Click **Save**
2. Wait 1-2 minutes for Coolify to regenerate proxy config
3. Try accessing https://play.val-x.com/ again

## 🐛 Still Not Working?

### Check Container Status
1. In Coolify Jellyfin service, check the **Logs** tab
2. Container should show "healthy" status
3. If showing "unhealthy", wait 3-5 minutes for initialization

### Common Issues

#### Issue 1: Port Mismatch
❌ Wrong: Target port = 8097
✅ Correct: Target port = 8096

#### Issue 2: Container Not Healthy
- Check logs for startup errors
- Wait 3-5 minutes for Jellyfin to fully initialize
- Health check runs every 30 seconds

#### Issue 3: Wrong Protocol
❌ Wrong: Target protocol = https
✅ Correct: Target protocol = http (Coolify handles SSL)

## 🔧 Alternative: Recreate Domain

If the issue persists:

1. **Delete** the `play.val-x.com` domain in Coolify
2. **Wait** 30 seconds
3. **Add** new domain:
   - Domain: `play.val-x.com`
   - Target Port: `8096`
   - Protocol: `http`
   - Enable SSL
4. **Save**
5. **Wait** 2 minutes
6. **Test** https://play.val-x.com/

## ✅ Expected Result

After fixing, you should see:
- Jellyfin login screen
- Or Jellyfin setup wizard (if first time)
- No more "Bad Gateway" error

## 📝 Quick Reference

| Setting | Value |
|---------|-------|
| External Port | 8096 (host port) |
| Internal Port | 8096 (container port) |
| Coolify Target Port | **8096** |
| Protocol | http |

## 🎯 Why This Happens

Coolify's Traefik reverse proxy routes `play.val-x.com` to the Jellyfin container. If the target port doesn't match the container's internal port (8096), you get "Bad Gateway".

## 📞 If Still Not Working

1. Check Jellyfin container logs in Coolify
2. Verify container is "healthy"
3. Check if port 8096 is actually listening in container
4. Try restarting the Jellyfin service in Coolify
5. Check Coolify's Traefik logs

