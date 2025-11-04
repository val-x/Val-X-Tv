#!/bin/bash

# Val-X Originals Backup Script
# Backs up MinIO data and user metadata

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
VOLUME_NAME="valx-originals_minio-data"

echo "Starting backup at $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup MinIO data volume
if docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo "Backing up MinIO data volume..."
    docker run --rm \
        -v "$VOLUME_NAME":/data:ro \
        -v "$(pwd)/$BACKUP_DIR":/backup \
        alpine \
        tar czf "/backup/minio-data-${DATE}.tar.gz" -C /data .
    
    echo "✓ MinIO data backed up: minio-data-${DATE}.tar.gz"
else
    echo "⚠ MinIO volume not found: $VOLUME_NAME"
fi

# Backup user metadata from MinIO (if container is running)
if docker ps | grep -q valx-minio; then
    echo "Backing up user metadata..."
    docker exec valx-minio mc mirror /data/users /backup/users-${DATE} 2>/dev/null || echo "⚠ Could not backup users"
    echo "✓ User metadata backed up"
fi

# Keep only last 7 days of backups
echo "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "minio-data-*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "users-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "Backup completed at $(date)"
echo "Backup location: $BACKUP_DIR"

