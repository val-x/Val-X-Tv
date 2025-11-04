#!/bin/bash

# Build script for Val-X web applications
# Builds both player and admin panel for production

set -e

echo "🚀 Building Val-X web applications..."

# Build Player
echo "📦 Building Val-X Player..."
cd web/valx-player
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
npm run build
echo "✅ Player built successfully"

# Build Admin
echo "📦 Building Val-X Admin..."
cd ../valx-admin
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
npm run build
echo "✅ Admin built successfully"

echo "🎉 All web applications built successfully!"
echo "📁 Build outputs:"
echo "   - Player: web/valx-player/dist"
echo "   - Admin: web/valx-admin/dist"

