#!/bin/bash
# Val-X Originals Diagnostic Script
# Run this on your server to diagnose service issues

echo "=========================================="
echo "Val-X Originals Service Diagnostics"
echo "=========================================="
echo ""

echo "=== Container Status ==="
docker ps -a | grep -E "valx|CONTAINER" || echo "No Val-X containers found"
echo ""

echo "=== Checking API Container ==="
API_CONTAINER=$(docker ps -a | grep valx-api | awk '{print $1}')
if [ -z "$API_CONTAINER" ]; then
    echo "❌ API container not found"
else
    echo "✓ API container found: $API_CONTAINER"
    echo "Status:"
    docker ps -a | grep valx-api
    echo ""
    echo "API Logs (last 20 lines):"
    docker logs --tail 20 $API_CONTAINER 2>&1 || echo "Cannot read logs"
    echo ""
    echo "Testing API health endpoint:"
    docker exec $API_CONTAINER curl -s http://localhost:8080/health 2>&1 || echo "Health check failed"
fi
echo ""

echo "=== Checking MinIO Container ==="
MINIO_CONTAINER=$(docker ps -a | grep valx-minio | awk '{print $1}')
if [ -z "$MINIO_CONTAINER" ]; then
    echo "❌ MinIO container not found"
    echo "⚠️  This is likely why API is unhealthy!"
else
    echo "✓ MinIO container found: $MINIO_CONTAINER"
    echo "Status:"
    docker ps -a | grep valx-minio
    echo ""
    echo "MinIO Logs (last 20 lines):"
    docker logs --tail 20 $MINIO_CONTAINER 2>&1 || echo "Cannot read logs"
    echo ""
    echo "Testing MinIO health:"
    docker exec $MINIO_CONTAINER curl -s http://localhost:9000/minio/health/live 2>&1 || echo "Health check failed"
fi
echo ""

echo "=== Checking Jellyfin Container ==="
JELLYFIN_CONTAINER=$(docker ps -a | grep valx-jellyfin | awk '{print $1}')
if [ -z "$JELLYFIN_CONTAINER" ]; then
    echo "❌ Jellyfin container not found"
else
    echo "✓ Jellyfin container found: $JELLYFIN_CONTAINER"
    echo "Status:"
    docker ps -a | grep valx-jellyfin
    echo ""
    echo "Jellyfin Logs (last 20 lines):"
    docker logs --tail 20 $JELLYFIN_CONTAINER 2>&1 || echo "Cannot read logs"
    echo ""
    echo "Testing Jellyfin:"
    docker exec $JELLYFIN_CONTAINER curl -s -o /dev/null -w "%{http_code}" http://localhost:8096 2>&1 || echo "Health check failed"
fi
echo ""

echo "=== Docker Network Check ==="
docker network ls | grep valx || echo "No Val-X network found"
echo ""
NETWORK_NAME=$(docker network ls | grep valx | awk '{print $1}' | head -1)
if [ ! -z "$NETWORK_NAME" ]; then
    echo "Network details:"
    docker network inspect $NETWORK_NAME --format '{{range .Containers}}{{.Name}} {{end}}' 2>&1 || echo "Cannot inspect network"
fi
echo ""

echo "=== Environment Variables Check ==="
if [ ! -z "$API_CONTAINER" ]; then
    echo "API Environment (MinIO config):"
    docker exec $API_CONTAINER env | grep -E "MINIO|JWT" || echo "Cannot read env"
fi
echo ""

if [ ! -z "$JELLYFIN_CONTAINER" ]; then
    echo "Jellyfin Environment:"
    docker exec $JELLYFIN_CONTAINER env | grep JELLYFIN || echo "Cannot read env"
fi
echo ""

echo "=== Docker Compose Check ==="
if [ -f "docker-compose.yml" ]; then
    echo "✓ docker-compose.yml found"
    echo "Services defined:"
    grep -E "^  [a-z-]+:" docker-compose.yml | sed 's/://' | sed 's/^  //' || echo "Cannot read compose file"
else
    echo "❌ docker-compose.yml not found in current directory"
    echo "Current directory: $(pwd)"
fi
echo ""

echo "=== Quick Fix Suggestions ==="
if [ -z "$MINIO_CONTAINER" ]; then
    echo "1. MinIO is not running - API depends on it!"
    echo "   → Check Coolify dashboard to see if MinIO service is configured"
    echo "   → Or manually start: docker-compose up -d minio"
fi

if [ -z "$JELLYFIN_CONTAINER" ]; then
    echo "2. Jellyfin is not running"
    echo "   → Check Coolify dashboard to see if Jellyfin service is configured"
    echo "   → Or manually start: docker-compose up -d jellyfin"
fi

if [ ! -z "$API_CONTAINER" ]; then
    API_STATUS=$(docker inspect $API_CONTAINER --format '{{.State.Status}}' 2>/dev/null)
    if [ "$API_STATUS" != "running" ]; then
        echo "3. API container is not running"
        echo "   → Check logs above for errors"
        echo "   → Restart: docker restart $API_CONTAINER"
    else
        HEALTH=$(docker inspect $API_CONTAINER --format '{{.State.Health.Status}}' 2>/dev/null)
        if [ "$HEALTH" = "unhealthy" ]; then
            echo "3. API is unhealthy - likely because MinIO is not running"
            echo "   → Start MinIO first: docker-compose up -d minio"
            echo "   → Then restart API: docker restart $API_CONTAINER"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "Diagnostics complete"
echo "=========================================="

