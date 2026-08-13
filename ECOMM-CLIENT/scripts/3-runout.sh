#!/bin/bash
# scripts/quick-start.sh - One-command setup

echo "🚀 Quick starting eCommerce Client..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env..."
    cp .env.example .env
fi

# Start development server
echo "🚀 Starting development server..."
npm run dev