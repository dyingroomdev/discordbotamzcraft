# System Architecture

## Overview

FastAPI backend + Discord bot architecture with async operations throughout.

## Components

### 1. FastAPI Backend
- Async SQLAlchemy 2.x with PostgreSQL
- Redis for caching and job queues
- JWT authentication
- Media upload handling
- RESTful API endpoints

### 2. Discord Bot
- py-cord library
- Slash commands
- Event handlers
- API client for backend

### 3. Background Workers
- Broadcast job processor
- Status update tasks
- Cache warming

### 4. Data Layer
- PostgreSQL (primary data)
- Redis (cache + queues)
- S3/Local (media storage)

## Request Flow

```
User → Discord → Bot → API → Database
                    ↓
                  Redis
```

## Key Patterns

- Async/await everywhere
- Dependency injection
- Repository pattern
- Job queues for async tasks
- Token-based templating
- HMAC signatures for security
