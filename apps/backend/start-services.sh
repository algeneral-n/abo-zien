#!/bin/bash

# RARE 4N - Start Backend and Cloudflare Tunnel
# تشغيل Backend و Cloudflare Tunnel تلقائياً

echo "🚀 Starting RARE 4N Services..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if process is running
check_process() {
    if pgrep -f "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    if check_process "node.*server.js"; then
        echo -e "${YELLOW}⚠️  Backend is already running${NC}"
    else
        echo -e "${GREEN}📦 Starting Backend...${NC}"
        cd backend
        npm start > ../logs/backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../logs/backend.pid
        echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
        cd ..
    fi
}

# Function to start Cloudflare Tunnel
start_cloudflare() {
    if check_process "cloudflared"; then
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel is already running${NC}"
    else
        echo -e "${GREEN}☁️  Starting Cloudflare Tunnel...${NC}"
        cd backend
        ./cloudflared tunnel --config config.yml run > ../logs/cloudflare.log 2>&1 &
        CLOUDFLARE_PID=$!
        echo $CLOUDFLARE_PID > ../logs/cloudflare.pid
        echo -e "${GREEN}✅ Cloudflare Tunnel started (PID: $CLOUDFLARE_PID)${NC}"
        cd ..
    fi
}

# Create logs directory
mkdir -p logs

# Start services
start_backend
sleep 2
start_cloudflare

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   - Backend: logs/backend.log"
echo "   - Cloudflare: logs/cloudflare.log"
echo ""
echo -e "${YELLOW}🛑 To stop services:${NC}"
echo "   ./stop-services.sh"
echo ""


