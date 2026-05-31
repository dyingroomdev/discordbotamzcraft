#!/bin/bash

echo "🚀 Deploying Discord Bot to Production..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production file not found."
    echo "❗ Please create .env.production with:"
    echo "  - DATABASE_URL (update password and database name)"
    echo "  - DISCORD_BOT_TOKEN"
    echo "  - DISCORD_CLIENT_ID"
    echo "  - DISCORD_CLIENT_SECRET"
    echo "  - JWT_SECRET"
    echo "  - BOT_WEBHOOK_SECRET"
    exit 1
fi

if grep -Eq "YOUR_|CHANGE_THIS|some-postgres|postgres:password|redis:6379" .env.production; then
    echo "❗ .env.production still contains placeholder values."
    echo "  Update DATABASE_URL, REDIS_URL, DISCORD_BOT_TOKEN, DISCORD_CLIENT_SECRET, JWT_SECRET, and BOT_WEBHOOK_SECRET before deploying."
    exit 1
fi

# Build services
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Start services
echo "🔄 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
docker exec discord-api alembic upgrade head

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🌐 Configure NPM (Nginx Proxy Manager):"
echo "  Backend API: dc.amzcraft.top → localhost:4000"
echo "  Frontend: discord.amzcraft.top → localhost:4002"
echo ""
echo "⚠️  Don't forget to enable SSL in NPM!"
