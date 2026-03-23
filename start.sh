#!/bin/bash

# NovaMind Quick Start Script
# This script starts MongoDB, backend, and frontend automatically

echo "🧠 Starting NovaMind..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}❌ MongoDB not found. Please install MongoDB first.${NC}"
    echo "Visit: https://www.mongodb.com/docs/manual/installation/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
cd ..

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Start MongoDB
echo -e "${BLUE}🗄️  Starting MongoDB...${NC}"
mongod --fork --logpath /tmp/mongodb.log --dbpath /data/db 2>/dev/null || {
    echo -e "${BLUE}MongoDB already running or using default location${NC}"
}

sleep 2

# Start backend
echo -e "${BLUE}🚀 Starting backend server...${NC}"
cd server
npm start &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend
echo -e "${BLUE}🌐 Starting frontend...${NC}"
npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}✓✓✓ NovaMind is running!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 NovaMind is ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "MongoDB:   ${BLUE}mongodb://localhost:27017/novamind${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping NovaMind..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# Keep script running
wait
