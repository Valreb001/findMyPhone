#!/bin/bash

# Find My Phone - Development Setup Script

echo "🚀 Find My Phone - Setup Script"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION"

# Setup Server
echo ""
echo "📦 Setting up Server..."
cd server
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created server/.env"
fi

cd ..

# Setup Client
echo ""
echo "📦 Setting up Client..."
cd client
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created client/.env"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start server: cd server && npm run dev"
echo "2. Start client: cd client && npm run dev (in another terminal)"
echo "3. Open browser: http://localhost:5173"
echo ""
