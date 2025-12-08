# Production Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Domain names configured:
  - `dc.amzcraft.xyz` → Backend API
  - `discord.amzcraft.xyz` → Frontend
- SSL certificates (Let's Encrypt recommended)
- Docker network `pg-network` created

## Setup Steps

### 1. Create Docker Network
```bash
docker network create pg-network
```

### 2. Configure Environment Variables
```bash
# Copy and edit production environment file
cp .env.production .env

# Update these values in .env:
# - DISCORD_BOT_TOKEN
# - DISCORD_CLIENT_ID
# - DISCORD_CLIENT_SECRET
# - JWT_SECRET (generate strong random string)
# - BOT_WEBHOOK_SECRET (generate strong random string)
```

### 3. Build and Start Services
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Run Database Migrations
```bash
# Run migrations inside API container
docker exec -it discord-api alembic upgrade head
```

### 5. Configure Reverse Proxy (Nginx/Caddy)

#### For Backend API (dc.amzcraft.xyz)
```nginx
server {
    listen 443 ssl http2;
    server_name dc.amzcraft.xyz;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### For Frontend (discord.amzcraft.xyz)
```nginx
server {
    listen 443 ssl http2;
    server_name discord.amzcraft.xyz;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Discord OAuth Configuration
Update Discord Developer Portal:
- Redirect URI: `https://discord.amzcraft.xyz/auth/callback`

## Service Management

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f bot
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

## Backup

### Database Backup
```bash
docker exec discord-postgres pg_dump -U postgres amaze > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker exec -i discord-postgres psql -U postgres amaze < backup_20240101.sql
```

## Monitoring

### Check Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check Resource Usage
```bash
docker stats
```

## Troubleshooting

### Bot Not Connecting
- Check `DISCORD_BOT_TOKEN` in `.env`
- Verify bot has proper intents enabled in Discord Developer Portal
- Check bot logs: `docker logs discord-bot`

### API Not Responding
- Check API logs: `docker logs discord-api`
- Verify database connection
- Check if port 4000 is accessible

### Frontend Not Loading
- Check nginx logs: `docker logs discord-frontend`
- Verify `VITE_API_URL` is set correctly
- Check browser console for errors

## Security Checklist
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable SSL/TLS for all domains
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Review Discord bot permissions
