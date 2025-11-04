#!/bin/bash

# Val-X Originals Restore Script
# Restores MinIO data from backup

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/minio-data-*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace all MinIO data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

VOLUME_NAME="valx-originals_minio-data"

# Stop services
echo "Stopping services..."
docker-compose -f deploy/docker-compose.yml stop minio || true

# Remove existing volume if it exists
if docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo "Removing existing volume..."
    docker volume rm "$VOLUME_NAME" || true
fi

# Create new volume
echo "Creating new volume..."
docker volume create "$VOLUME_NAME"

# Restore data
echo "Restoring data from backup..."
docker run --rm \
    -v "$VOLUME_NAME":/data \
    -v "$(pwd)/$(dirname "$BACKUP_FILE")":/backup:ro \
    alpine \
    sh -c "cd /data && tar xzf /backup/$(basename "$BACKUP_FILE")"

echo "✓ Restore completed"
echo "Starting services..."
docker-compose -f deploy/docker-compose.yml up -d minio

echo "✓ Services restarted. Please verify data integrity."

