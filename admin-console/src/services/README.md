# API Client Layer

Centralized API client with typed methods, error handling, and retry logic.

## Usage Examples

### Basic Query Hook

```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function useGuilds() {
  return useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      const { data } = await apiClient.guilds.list()
      return data
    },
  })
}
```

### Mutation Hook with Invalidation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function useCreateBroadcast(guildId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.broadcasts.create(guildId, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts', guildId] })
    },
  })
}
```

### File Upload with Progress

```typescript
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useState } from 'react'

export function useUploadMedia(guildId: string) {
  const [progress, setProgress] = useState(0)
  
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('media', file)
      
      const { data } = await apiClient.media.upload(
        guildId,
        formData,
        setProgress
      )
      return data
    },
  })
  
  return { ...mutation, progress }
}
```

### Error Handling

```typescript
import { apiClient, APIError } from '@/services/api'

try {
  const { data } = await apiClient.moderation.action(guildId, {
    action: 'ban',
    target_id: userId,
    reason: 'Spam',
  })
} catch (error) {
  const apiError = error as APIError
  console.error(`Error ${apiError.status}: ${apiError.message}`)
  
  if (apiError.code === 'PERMISSION_DENIED') {
    // Handle permission error
  }
}
```

## API Client Structure

```typescript
apiClient = {
  auth: {
    getOAuthUrl()
    callback(code)
    me()
    logout()
  },
  
  guilds: {
    list()
    get(guildId)
    channels(guildId)
    permissions(guildId)
  },
  
  welcomeBanners: {
    list(guildId)
    create(guildId, data)
    update(guildId, bannerId, data)
    delete(guildId, bannerId)
    preview(guildId, data)
  },
  
  leaveBanners: { /* same as welcomeBanners */ },
  
  broadcasts: {
    list(guildId)
    create(guildId, data)
    queue()
  },
  
  media: {
    list(guildId)
    upload(guildId, file, onProgress?)
    delete(guildId, mediaId)
  },
  
  minecraft: {
    list(guildId)
    create(guildId, data)
    update(guildId, serverId, data)
    delete(guildId, serverId)
    status(address, type)
    summary()
  },
  
  moderation: {
    logs(guildId, params?)
    action(guildId, data)
  },
  
  xp: {
    leaderboard(guildId, limit?, range?)
    increment(guildId, data)
  },
  
  health: {
    status()
    bot()
  }
}
```

## Error Shape

All errors are normalized to:

```typescript
interface APIError {
  status: number      // HTTP status code
  code: string        // Error code (e.g., 'PERMISSION_DENIED')
  message: string     // Human-readable message
  details?: any       // Additional error details
}
```

## Features

- ✅ Automatic auth token attachment
- ✅ 401 redirect to login
- ✅ Network error retry with backoff
- ✅ Typed methods for all endpoints
- ✅ File upload progress tracking
- ✅ Cookie support (withCredentials)
- ✅ Centralized error handling
- ✅ Base URL from environment

## Configuration

Set in `.env`:

```
VITE_API_BASE=http://localhost:4000
```

## Interceptors

### Request Interceptor
- Attaches JWT token from localStorage
- Sets Authorization header

### Response Interceptor
- Handles 401 → redirect to login
- Retries network errors (max 1 retry with 1s backoff)
- Formats errors to standard shape
