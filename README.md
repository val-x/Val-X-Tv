# Val-X Dual Station - TV + FM

Professional music streaming solution with both **Val-X TV** (music videos) and **Val-X FM** (audio radio) using Plex + ErsatzTV.

## 🎯 What You Get

### 📺 Val-X TV (Music Videos)
- **URL:** `http://your-domain:8409`
- Professional TV channel creation
- Advanced scheduling
- Commercial break support
- EPG generation
- Multiple quality streams

### 📻 Val-X FM (Audio Radio)
- **URL:** `http://your-domain:8410`
- Professional radio station
- Audio streaming
- Playlist management
- DJ-style broadcasting
- Multiple audio channels

### 📱 Plex Media Server
- **URL:** `http://your-domain:32400/web`
- Professional media management
- User accounts and sharing
- Mobile apps support
- Live TV integration
- Supports both TV and FM content

## 🚀 Quick Deploy to Coolify

### Step 1: Prepare Your Repository

1. **Fork this repository** or create a new one
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

In Coolify, add these environment variables:

```
PLEX_CLAIM=your-plex-claim-token
```

**To get your Plex claim token:**
1. Visit: https://plex.tv/claim
2. Sign in to your Plex account
3. Copy the claim token
4. Add it as `PLEX_CLAIM` in Coolify

## 📁 Project Structure

```
val-x-dual-station/
├── docker-compose.yml      # Main deployment file
├── setup.sh               # Setup script
├── README.md              # Main documentation
├── DEPLOY.md              # Quick deployment guide
├── .gitignore             # Git ignore rules
├── videos/                # Val-X TV music videos
│   └── README.md         # TV instructions
├── audio/                 # Val-X FM audio files
│   └── README.md         # FM instructions
├── ersatztv-tv-config/    # Val-X TV configuration
├── ersatztv-fm-config/    # Val-X FM configuration
├── ersatztv-tv-output/    # Val-X TV output
├── ersatztv-fm-output/    # Val-X FM output
├── plex-config/          # Plex configuration
└── plex-transcode/       # Plex transcoding cache
```

## 🎵 What You Get

### ErsatzTV (Professional TV Channels)
- **URL:** `http://your-domain:8409`
- **Features:**
  - Multiple TV channels
  - Advanced scheduling
  - Commercial break support
  - EPG generation
  - Professional broadcasting

### Plex Media Server (Media Management)
- **URL:** `http://your-domain:32400/web`
- **Features:**
  - Professional media management
  - User accounts and sharing
  - Mobile apps support
  - Live TV integration
  - Automatic transcoding

## 🔧 Setup Instructions

### ErsatzTV Setup

1. **Access ErsatzTV:** `http://your-domain:8409`
2. **Create admin account**
3. **Add media library:**
   - Path: `/media/music-videos`
   - Type: Movies or TV Shows
4. **Create channels:**
   - Add new channel
   - Configure schedule
   - Add content
5. **Start streaming**

### Plex Setup

1. **Access Plex:** `http://your-domain:32400/web`
2. **Complete setup wizard**
3. **Add music videos library:**
   - Go to Settings → Libraries
   - Add Library → Movies
   - Browse to `/data/music-videos`
4. **Configure Live TV:**
   - Go to Settings → Live TV & DVR
   - Enable Live TV & DVR
   - Add ErsatzTV as source

## 📱 How to Watch

### ErsatzTV Streams
- **RTSP:** `rtsp://your-domain:8554/live`
- **Via Plex:** Add as Live TV source

### Plex Access
- **Web:** `http://your-domain:32400/web`
- **Mobile Apps:** Download Plex app
- **Smart TV:** Install Plex app
- **Gaming Consoles:** Install Plex app

## 🎯 Use Cases

### Professional Broadcasting
- Use ErsatzTV for multiple channels
- Create program schedules
- Add commercial breaks
- Generate EPG

### Family Sharing
- Use Plex for easy sharing
- Create user accounts
- Access from mobile apps
- Remote streaming

### Combined Approach
- ErsatzTV creates professional channels
- Plex provides user-friendly access
- Best of both worlds

## 🔒 Security

- **Plex:** Built-in user authentication
- **ErsatzTV:** Admin account protection
- **Coolify:** SSL/TLS support
- **Network:** Internal Docker networking

## 💰 Cost

- **ErsatzTV:** Free
- **Plex:** Free (Plex Pass optional)
- **Coolify:** Your existing server
- **Total:** $0 + server costs

## 🛠️ Troubleshooting

### Services Not Starting
- Check Coolify logs
- Verify environment variables
- Ensure ports are accessible

### Can't Access Services
- Check Coolify proxy configuration
- Verify domain settings
- Check firewall rules

### Videos Not Playing
- Verify video files are in `videos/` directory
- Check file permissions
- Ensure supported formats

## 📚 Supported Video Formats

- **MP4** (recommended)
- **MKV**
- **AVI**
- **MOV**
- **WMV**

## ⚖️ Legal Notice

⚠️ **Important:** Only stream content you have rights to distribute.

Consider using:
- Creative Commons music videos
- Royalty-free content
- Your own recordings
- Content with proper licenses

## 🎉 Enjoy Your Music TV Station!

Deploy to Coolify and start streaming your music video collection 24/7! 🎵📺

---

**Happy Streaming!** 🚀
