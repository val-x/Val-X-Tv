#!/bin/bash

# Val-X Dual Station Setup Script
# Sets up both Val-X TV (music videos) and Val-X FM (audio radio)

echo "🎵 Setting up Val-X Dual Station (TV + FM) for Coolify"
echo "====================================================="

# Create necessary directories
mkdir -p ersatztv-config
mkdir -p ersatztv-output
mkdir -p jellyfin-config
mkdir -p jellyfin-cache
mkdir -p jellyfin-transcode
mkdir -p videos
mkdir -p audio

# Create sample content placeholders
cat > videos/README.md << 'EOF'
# Val-X TV - Music Videos

Place your music video files in this directory for Val-X TV.

Supported formats: .mp4, .mkv, .avi, .mov, .wmv

Example:
```bash
cp /path/to/your/videos/*.mp4 ./videos/
```

Note: Only add content you have rights to distribute.
EOF

cat > audio/README.md << 'EOF'
# Val-X FM - Audio Music

Place your audio music files in this directory for Val-X FM radio station.

Supported formats: .mp3, .flac, .aac, .ogg, .wav, .m4a

Example:
```bash
cp /path/to/your/music/*.mp3 ./audio/
```

Note: Only add content you have rights to distribute.
EOF

echo "✅ Val-X Dual Station setup complete!"
echo ""
echo "📺📻 Val-X Station (TV + FM):"
echo "  - Add videos to: ./videos/"
echo "  - Add audio to: ./audio/"
echo "  - Access at: https://ersatztv.val-x.com"
echo "  - Single ErsatzTV instance manages both TV and FM channels"
echo ""
echo "📱 Jellyfin Media Server:"
echo "  - Access at: https://jellyfin.val-x.com"
echo "  - Open-source alternative to Plex"
echo "  - No licensing restrictions"
echo "  - Supports both TV and FM content"
echo ""
echo "Next steps:"
echo "1. Add your music videos to ./videos/"
echo "2. Add your audio files to ./audio/"
echo "3. Deploy to Coolify"
echo "4. Configure Val-X TV and Val-X FM channels"
echo "5. Set up Jellyfin media libraries"