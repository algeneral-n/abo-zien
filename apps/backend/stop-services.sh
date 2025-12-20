#!/bin/bash

# RARE 4N - Stop Backend and Cloudflare Tunnel
# إيقاف Backend و Cloudflare Tunnel

echo "🛑 Stopping RARE 4N Services..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Stop backend
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend was not running${NC}"
    fi
    rm logs/backend.pid
else
    pkill -f "node.*server.js" && echo -e "${GREEN}✅ Backend stopped${NC}" || echo -e "${YELLOW}⚠️  Backend was not running${NC}"
fi

# Stop Cloudflare
if [ -f logs/cloudflare.pid ]; then
    CLOUDFLARE_PID=$(cat logs/cloudflare.pid)
    if kill -0 $CLOUDFLARE_PID 2>/dev/null; then
        kill $CLOUDFLARE_PID
        echo -e "${GREEN}✅ Cloudflare Tunnel stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel was not running${NC}"
    fi
    rm logs/cloudflare.pid
else
    pkill -f "cloudflared" && echo -e "${GREEN}✅ Cloudflare Tunnel stopped${NC}" || echo -e "${YELLOW}⚠️  Cloudflare Tunnel was not running${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped!${NC}"


