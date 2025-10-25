#!/bin/bash

# Coolify Music TV Station Setup
# Simple setup for Plex + ErsatzTV on Coolify

echo "🎵 Setting up Music TV Station for Coolify"
echo "=========================================="

# Create necessary directories
mkdir -p ersatztv-config
mkdir -p plex-config
mkdir -p plex-transcode
mkdir -p ersatztv-output
mkdir -p videos

# Create sample video placeholder
cat > videos/README.md << 'EOF'
# Add Your Music Videos Here

Place your music video files in this directory.

Supported formats:
- .mp4
- .mkv
- .avi
- .mov
- .wmv

Example:
```bash
# Copy your music videos
cp /path/to/your/videos/*.mp4 ./videos/
```

Note: Only add content you have rights to distribute.
EOF

# Create initial ErsatzTV configuration
cat > ersatztv-config/ersatztv.yaml << 'EOF'
# ErsatzTV Configuration
# This file will be created automatically on first run
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your music videos to the 'videos' directory"
echo "2. Deploy to Coolify"
echo "3. Set PLEX_CLAIM environment variable in Coolify"
echo "4. Access ErsatzTV at http://your-domain:8409"
echo "5. Access Plex at http://your-domain:32400/web"
echo ""
echo "For Plex setup:"
echo "- Get claim token from: https://plex.tv/claim"
echo "- Add as PLEX_CLAIM environment variable in Coolify"
echo ""
echo "For ErsatzTV setup:"
echo "- Create admin account"
echo "- Add media library pointing to /media/music-videos"
echo "- Create channels and schedules"
echo "- Start streaming"
