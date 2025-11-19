#!/bin/bash
# scripts/mobile-dev.sh

# Get the local IP address (macOS)
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

echo "🚀 Starting Mobile Dev Server on $IP..."
echo "📱 Ensure your phone is on the same Wi-Fi!"

# Navigate to frontend and run vite with host
cd frontend
npm run dev -- --host
