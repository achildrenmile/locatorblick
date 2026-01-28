#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ".env.production" ]; then
    source .env.production
else
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Validate required variables
REQUIRED_VARS="SERVER_HOST REMOTE_DIR CONTAINER_NAME IMAGE_NAME CONTAINER_PORT SITE_URL"
for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env.production${NC}"
        exit 1
    fi
done

# Docker command (Synology uses a specific path)
DOCKER_CMD="${DOCKER_CMD:-docker}"

# Check for --rebuild flag
REBUILD_FLAG=""
if [ "$1" == "--rebuild" ]; then
    REBUILD_FLAG="--no-cache"
    echo -e "${YELLOW}Rebuild flag set - will build without cache${NC}"
fi

echo -e "${GREEN}=== Deploying Locatorblick to $SERVER_HOST ===${NC}"
echo "Remote dir: $REMOTE_DIR"
echo "Container: $CONTAINER_NAME"
echo "Port: $CONTAINER_PORT"
echo ""

# Step 1: Ensure remote directory exists and sync code
echo -e "${GREEN}Step 1: Syncing code to server...${NC}"
ssh "$SERVER_HOST" "mkdir -p '$REMOTE_DIR'"

# Get git remote URL
GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$GIT_REMOTE" ]; then
    ssh "$SERVER_HOST" "
        if [ -d '$REMOTE_DIR/.git' ]; then
            cd '$REMOTE_DIR' && git pull
        else
            rm -rf '$REMOTE_DIR'
            git clone '$GIT_REMOTE' '$REMOTE_DIR'
        fi
    "
else
    # No git remote, use rsync
    echo -e "${YELLOW}No git remote found, using rsync...${NC}"
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude 'dist' \
        --exclude '.git' \
        --exclude '.env.production' \
        ./ "$SERVER_HOST:$REMOTE_DIR/"
fi

# Step 2: Build Docker image on server
echo -e "${GREEN}Step 2: Building Docker image on server...${NC}"
ssh "$SERVER_HOST" "
    cd '$REMOTE_DIR'
    sudo $DOCKER_CMD build $REBUILD_FLAG -t '$IMAGE_NAME' .
"

# Step 3: Restart container
echo -e "${GREEN}Step 3: Restarting container...${NC}"
ssh "$SERVER_HOST" "
    # Stop and remove existing container if it exists
    sudo $DOCKER_CMD stop '$CONTAINER_NAME' 2>/dev/null || true
    sudo $DOCKER_CMD rm '$CONTAINER_NAME' 2>/dev/null || true

    # Start new container with health check
    sudo $DOCKER_CMD run -d \
        --name '$CONTAINER_NAME' \
        --restart unless-stopped \
        -p '$CONTAINER_PORT' \
        --health-cmd='wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1' \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        --health-start-period=10s \
        '$IMAGE_NAME'
"

# Step 4: Verify deployment
echo -e "${GREEN}Step 4: Verifying deployment...${NC}"
sleep 3

# Check container status
CONTAINER_STATUS=$(ssh "$SERVER_HOST" "sudo $DOCKER_CMD ps --filter 'name=$CONTAINER_NAME' --format '{{.Status}}'")
echo "Container status: $CONTAINER_STATUS"

# Check if site is accessible on local port
echo "Checking local accessibility..."
LOCAL_PORT=$(echo $CONTAINER_PORT | cut -d: -f1)
if ssh "$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$LOCAL_PORT" | grep -q "200"; then
    echo -e "${GREEN}✓ Container is running on port $LOCAL_PORT${NC}"
else
    echo -e "${RED}✗ Container may not be accessible on port $LOCAL_PORT${NC}"
fi

# Check public URL (may fail if cloudflared not yet configured)
echo "Checking public URL..."
if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓ Site is accessible at $SITE_URL${NC}"
else
    echo -e "${YELLOW}⚠ Public URL not yet accessible - configure Cloudflare Tunnel${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment complete ===${NC}"
echo ""
echo "Next steps if not already done:"
echo "1. Configure Cloudflare Tunnel for locatorblick.oeradio.at -> localhost:$LOCAL_PORT"
echo "2. Create CNAME record: locatorblick.oeradio.at -> your-tunnel.cfargotunnel.com"
