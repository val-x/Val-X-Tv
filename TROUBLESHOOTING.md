# Troubleshooting Guide - Gateway Timeout Issues

## 🔧 Common Gateway Timeout Causes & Solutions

### 1. Plex Startup Time
**Issue:** Plex takes 2-5 minutes to fully start up
**Solution:** Wait for Plex to complete initialization

### 2. Missing PLEX_CLAIM Token
**Issue:** Plex can't claim the server
**Solution:** Set PLEX_CLAIM environment variable in Coolify

### 3. Permission Issues
**Issue:** Plex can't access media files
**Solution:** Check PUID/PGID settings (should be 1000:1000)

### 4. Port Conflicts
**Issue:** Port 32400 already in use
**Solution:** Check if another service is using port 32400

## 🚀 Quick Fixes

### Check Container Status
```bash
# Check if containers are running
docker ps

# Check Plex logs
docker logs plex-val-x

# Check ErsatzTV logs
docker logs val-x-station
```

### Verify Plex Claim Token
1. Go to: https://plex.tv/claim
2. Sign in to your Plex account
3. Copy the claim token
4. Add as `PLEX_CLAIM` environment variable in Coolify

### Test Direct Access
- Try accessing Plex directly: `http://your-server-ip:32400/web`
- If this works, the issue is with the domain/proxy configuration

## 🔍 Debugging Steps

### 1. Check Coolify Logs
- Go to Coolify → Your Project → Logs
- Look for Plex startup messages
- Check for error messages

### 2. Verify Environment Variables
- Ensure `PLEX_CLAIM` is set in Coolify
- Check that `PUID=1000` and `PGID=1000`

### 3. Test Container Health
```bash
# Check if Plex is responding
curl -f http://localhost:32400/web

# Check container health
docker inspect plex-val-x | grep Health
```

## ⚡ Quick Solutions

### Solution 1: Restart Services
1. Stop the deployment in Coolify
2. Wait 30 seconds
3. Start the deployment again
4. Wait 5 minutes for full startup

### Solution 2: Clear Plex Config
1. Stop the deployment
2. Delete `./plex-config` directory
3. Restart deployment
4. Complete Plex setup wizard

### Solution 3: Check Domain Configuration
- Verify domain points to correct service
- Check Coolify proxy settings
- Ensure SSL certificates are valid

## 📞 Still Having Issues?

If Gateway Timeout persists:
1. Check Coolify logs for specific errors
2. Verify all environment variables are set
3. Test direct IP access to rule out domain issues
4. Consider increasing Coolify timeout settings
