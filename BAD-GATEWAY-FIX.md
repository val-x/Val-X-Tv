# Bad Gateway Troubleshooting - Coolify Proxy Issue

## 🔍 Current Status Analysis

**✅ Working:**
- Direct IP: `https://168.231.125.161:32400/web` → Redirects to Plex auth
- Container: Plex is running and healthy
- ErsatzTV: Likely working fine

**❌ Not Working:**
- Subdomain: `https://plex.val-x.com/` → Bad Gateway
- Previous path: `https://station.val-x.com/plex` → Bad Gateway

## 🎯 Root Cause: Coolify Proxy Configuration

The issue is in Coolify's reverse proxy setup, not the containers.

## 🔧 Step-by-Step Fix

### Step 1: Check Coolify Domain Configuration

In Coolify, verify these settings for the `plex` service:

**Domain Settings:**
- **Domain:** `plex.val-x.com`
- **Target Port:** `32400`
- **Target Container:** `plex-val-x`
- **Protocol:** `http` (not https for internal routing)
- **SSL:** Enabled for external access

### Step 2: Verify Container Network

Check if containers are on the correct network:

```bash
# Check container networks
docker network ls
docker network inspect val-x-network

# Check if plex container is on the network
docker inspect plex-val-x | grep NetworkMode
```

### Step 3: Test Internal Connectivity

```bash
# Test if Coolify can reach the container internally
docker exec -it plex-val-x curl -f http://localhost:32400/web

# Check if the container is listening on the right port
docker exec -it plex-val-x netstat -tlnp | grep 32400
```

### Step 4: Check Coolify Proxy Logs

In Coolify:
1. Go to your project
2. Check the **Logs** section
3. Look for proxy-related errors
4. Check for SSL certificate issues

### Step 5: Verify DNS Resolution

```bash
# Test DNS resolution
nslookup plex.val-x.com
dig plex.val-x.com

# Should resolve to: 168.231.125.161
```

## 🚀 Quick Fixes to Try

### Fix 1: Restart Coolify Proxy
1. **Stop** the deployment in Coolify
2. **Wait 30 seconds**
3. **Start** the deployment again
4. **Wait 5 minutes** for full startup

### Fix 2: Recreate Domain Configuration
1. **Delete** the `plex.val-x.com` domain in Coolify
2. **Wait 30 seconds**
3. **Re-add** the domain:
   - Domain: `plex.val-x.com`
   - Port: `32400`
   - Container: `plex-val-x`

### Fix 3: Check SSL Certificate
1. **Verify** SSL certificate is valid for `plex.val-x.com`
2. **Check** if certificate includes the subdomain
3. **Regenerate** SSL certificate if needed

### Fix 4: Test Without SSL
Temporarily test with HTTP to isolate SSL issues:
- Try: `http://plex.val-x.com:32400/web`
- If this works → SSL/proxy issue
- If this fails → Container/routing issue

## 🔍 Advanced Debugging

### Check Coolify Configuration Files
Look for these files in Coolify:
- `/etc/nginx/sites-enabled/`
- `/etc/nginx/conf.d/`
- Look for `plex.val-x.com` configuration

### Test Different Ports
Try accessing Plex on different ports:
- `https://plex.val-x.com:32400/web`
- `https://plex.val-x.com:80/web`
- `https://plex.val-x.com:443/web`

### Check Firewall Rules
Ensure these ports are open:
- **80** (HTTP)
- **443** (HTTPS)
- **32400** (Plex)

## 📞 Still Having Issues?

If Bad Gateway persists:

1. **Check Coolify Documentation** for proxy configuration
2. **Contact Coolify Support** with specific error details
3. **Consider Alternative Setup:**
   - Use direct IP access temporarily
   - Set up custom reverse proxy
   - Use different domain structure

## 🎯 Expected Resolution

After applying these fixes:
- ✅ `https://plex.val-x.com/` should work
- ✅ `https://ersatztv.val-x.com/` should work
- ✅ No more Bad Gateway errors
- ✅ Proper SSL certificates
