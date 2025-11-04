#!/bin/bash

# Deployment script for Val-X web applications
# Builds and deploys web apps to Docker

set -e

echo "🚀 Deploying Val-X web applications..."

# Build first
echo "Building applications..."
bash scripts/build-web.sh

# Build and push Docker images (optional)
if [ "$1" == "--docker" ]; then
    echo "🐳 Building Docker images..."
    
    # Build Player
    cd web/valx-player
    docker build -t valx-player:latest .
    echo "✅ Player Docker image built"
    
    # Build Admin
    cd ../valx-admin
    docker build -t valx-admin:latest .
    echo "✅ Admin Docker image built"
    
    echo "🎉 Docker images built successfully!"
    echo "To run:"
    echo "  docker run -d -p 3000:80 valx-player:latest"
    echo "  docker run -d -p 3001:80 valx-admin:latest"
fi

echo "✅ Deployment complete!"

