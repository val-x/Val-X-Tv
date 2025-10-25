# Coolify Deployment Guide

## 🚀 One-Click Deployment to Coolify

### Step 1: Prepare Your Repository

1. **Fork this repository** or create a new GitHub repository
2. **Add your music videos** to the `videos/` directory
3. **Commit and push** to GitHub

### Step 2: Deploy to Coolify

1. **Go to Coolify** → Projects → New Project
2. **Choose "Git Repository"**
3. **Connect your GitHub repository**
4. **Select "Docker Compose"** as deployment type
5. **Use the docker-compose-coolify.yml file**
6. **Deploy!**

### Step 3: Configure Environment Variables

In Coolify, add this environment variable:

```
PLEX_CLAIM=your-plex-claim-token
```

**To get your Plex claim token:**
1. Visit: https://plex.tv/claim
2. Sign in to your Plex account
3. Copy the claim token
4. Add it as `PLEX_CLAIM` in Coolify

## 🎵 What You Get

### ErsatzTV (Professional TV Channels)
- **URL:** `http://your-domain:8409`
- Multiple TV channels
- Advanced scheduling
- Commercial break support
- EPG generation

### Plex Media Server (Media Management)
- **URL:** `http://your-domain:32400/web`
- Professional media management
- User accounts and sharing
- Mobile apps support
- Live TV integration

## 🔧 Quick Setup

### ErsatzTV
1. Access: `http://your-domain:8409`
2. Create admin account
3. Add media library: `/media/music-videos`
4. Create channels and schedules
5. Start streaming

### Plex
1. Access: `http://your-domain:32400/web`
2. Complete setup wizard
3. Add music videos library: `/data/music-videos`
4. Configure Live TV with ErsatzTV

## 📱 How to Watch

- **Plex Web:** `http://your-domain:32400/web`
- **Plex Mobile:** Download Plex app
- **Plex Smart TV:** Install Plex app
- **ErsatzTV:** `http://your-domain:8409`

## 🎯 Perfect For

- **Professional Broadcasting:** ErsatzTV for multiple channels
- **Family Sharing:** Plex for easy access
- **Combined Approach:** Best of both worlds

## 💰 Cost

- **Free:** ErsatzTV + Plex (free tier)
- **Server:** Your existing Coolify server
- **Total:** $0 + server costs

## ⚖️ Legal Notice

⚠️ Only stream content you have rights to distribute.

---

**Deploy and enjoy your music TV station!** 🎵📺
