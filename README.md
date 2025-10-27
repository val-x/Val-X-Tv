# Val-X Dual Station - TV + FM

Professional music streaming solution with both **Val-X TV** (music videos) and **Val-X FM** (audio radio) using ErsatzTV + AzuraCast + Jellyfin.

## 🎯 What You Get

### 📺 Val-X TV (Music Videos)
- **URL:** `https://tv.val-x.com`
- **Powered by:** ErsatzTV
- **TV Channels:** Music videos with professional scheduling
- **Advanced Features:** EPG generation, commercial breaks, multiple quality streams
- **Best for:** Video content streaming

### 📻 Val-X FM (Radio Station)
- **URL:** `https://fm.val-x.com`
- **Powered by:** AzuraCast
- **Radio Features:** Audio streaming, playlists, auto-DJ, analytics
- **Advanced Features:** Song requests, web DJ access, custom branding
- **Best for:** Audio content streaming

### 📱 Jellyfin Media Server
- **URL:** `https://play.val-x.com`
- **Open-Source:** No licensing restrictions or premium features
- **Free Software:** GPL 2.0 licensed, completely free
- **Professional Features:** Media management, transcoding, mobile apps
- **Live TV Integration:** Supports both TV and radio content
- **No Claims Required:** Works immediately without authentication

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

### Step 3: No Environment Variables Required!

Unlike Plex, both **AzuraCast** and **Jellyfin** work without any claim tokens or license keys. Just deploy and start using!

## 📁 Project Structure

```
val-x-station/
├── docker-compose.yml      # Complete deployment configuration
├── setup.sh               # Setup script
├── README.md              # Main documentation
├── DEPLOY.md              # Quick deployment guide
├── .gitignore             # Git ignore rules
├── videos/                # Val-X TV music videos
│   └── README.md         # TV instructions
├── audio/                 # Val-X FM audio files
│   └── README.md         # FM instructions
├── ersatztv-config/       # ErsatzTV configuration
├── ersatztv-output/       # ErsatzTV output
├── azuracast-data/        # AzuraCast data and configuration
├── jellyfin-config/       # Jellyfin configuration
├── jellyfin-cache/        # Jellyfin cache
└── jellyfin-transcode/    # Jellyfin transcoding cache
```

## 🎵 What You Get

### ErsatzTV (Professional TV Channels)
- **URL:** `https://tv.val-x.com`
- **Features:**
  - Multiple TV channels
  - Advanced scheduling
  - Commercial break support
  - EPG generation
  - Professional broadcasting
- **Best for:** Music video streaming

### AzuraCast (Radio Broadcasting)
- **URL:** `https://fm.val-x.com`
- **Features:**
  - Auto-DJ playlists
  - Song requests
  - Web DJ access
  - Station analytics
  - Custom branding
  - Multiple audio formats
  - Stream listeners tracking
- **Best for:** Audio radio streaming

### Jellyfin Media Server (Media Management)
- **URL:** `https://play.val-x.com`
- **Features:**
  - Professional media management
  - User accounts and sharing
  - Mobile apps support
  - Live TV integration
  - Automatic transcoding
  - No licensing restrictions

## 🔧 Setup Instructions

### ErsatzTV Setup (Val-X TV)

1. **Access ErsatzTV:** `https://tv.val-x.com`
2. **Create admin account**
3. **Add media library:**
   - Path: `/media/music-videos`
   - Type: Movies or TV Shows
4. **Create channels:**
   - Add new channel
   - Configure schedule
   - Add content
5. **Start streaming music videos**

### AzuraCast Setup (Val-X FM)

1. **Access AzuraCast:** `https://fm.val-x.com`
2. **First-time setup:**
   - Create admin account
   - Set timezone
   - Configure station
3. **Upload music:**
   - Go to Music Files
   - Upload your audio files
   - Create playlists
4. **Configure Auto-DJ:**
   - Set up playlists
   - Configure shuffle settings
   - Enable requests
5. **Start broadcasting**

### Jellyfin Setup

1. **Access Jellyfin:** `https://play.val-x.com`
2. **Complete setup wizard**
3. **Add media libraries:**
   - Music Videos: `/data/music-videos`
   - Audio Music: `/data/music-audio`
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
