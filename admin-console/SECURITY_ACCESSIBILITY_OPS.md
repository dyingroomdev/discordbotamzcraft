# Security, Accessibility & Operations Policy

## Accessibility

### Keyboard Navigation

**Sidebar Navigation**
- All navigation items are keyboard accessible via `Tab` key
- `Enter` or `Space` to activate links
- Focus indicators visible on all interactive elements
- Sidebar collapse/expand accessible via keyboard

**Forms**
- Logical tab order through form fields
- `Enter` to submit forms
- `Escape` to close modals
- Error messages announced to screen readers

**Tables**
- Arrow keys for row navigation
- `Enter` to select/activate row
- Sortable columns accessible via keyboard

**Command Palette**
- `Cmd/Ctrl + K` or `G` to open
- Arrow keys to navigate results
- `Enter` to select
- `Escape` to close

### ARIA Labels

All interactive elements include appropriate ARIA attributes:

```tsx
// Buttons
<button aria-label="Delete banner">
  <TrashIcon />
</button>

// Form inputs
<input aria-describedby="error-message" aria-invalid={!!error} />

// Status indicators
<div role="status" aria-live="polite">
  {statusMessage}
</div>

// Modals
<Dialog aria-labelledby="modal-title" aria-describedby="modal-description">
```

### Color Contrast

Brand palette meets WCAG AA standards:

| Element | Foreground | Background | Contrast Ratio |
|---------|-----------|------------|----------------|
| Primary text | #FFFFFF | #000000 | 21:1 ✅ |
| Brand accent | #52991f | #000000 | 4.8:1 ✅ |
| Error text | #ED4245 | #000000 | 5.2:1 ✅ |
| Success text | #57F287 | #000000 | 8.1:1 ✅ |
| Gray text | #9CA3AF | #000000 | 4.5:1 ✅ |

**Recommendations:**
- Use text labels alongside icons
- Provide focus indicators (2px outline)
- Support browser zoom up to 200%
- Test with screen readers (NVDA, JAWS, VoiceOver)

---

## Security

### Client-Side Security

**Never Store Secrets**
```tsx
// ❌ BAD - Never do this
const DISCORD_SECRET = "abc123..."

// ✅ GOOD - Only store public client ID
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
```

**Token Exchange**
- OAuth code exchange happens on backend only
- Backend returns JWT or sets HttpOnly cookie
- Client never sees Discord client secret

**Token Storage**
```tsx
// Option 1: HttpOnly Cookie (preferred)
// Backend sets: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict

// Option 2: localStorage (if needed)
localStorage.setItem('token', jwt) // Only for non-sensitive tokens
```

### Backend Requirements

**Secure Cookies**
```python
# FastAPI example
response.set_cookie(
    key="token",
    value=jwt_token,
    httponly=True,      # Not accessible via JavaScript
    secure=True,        # HTTPS only
    samesite="strict",  # CSRF protection
    max_age=3600        # 1 hour expiration
)
```

**CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://admin.yourdomain.com"],  # Specific origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Content Security Policy

Add to `index.html` or server headers:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://cdn.discordapp.com;
  connect-src 'self' http://localhost:4000 https://api.yourdomain.com;
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

**Production CSP (stricter):**
```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' https://cdn.discordapp.com;
connect-src 'self' https://api.yourdomain.com;
frame-ancestors 'none';
upgrade-insecure-requests;
```

### Input Validation

**Client-Side**
```tsx
// Validate before sending to API
const schema = z.object({
  name: z.string().min(1).max(100),
  text: z.string().max(2000),
  channel_id: z.number().positive(),
})

schema.parse(formData) // Throws if invalid
```

**File Uploads**
```tsx
// Validate file type and size
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type')
}
if (file.size > MAX_SIZE) {
  throw new Error('File too large')
}
```

### Rate Limiting

Client-side debouncing:
```tsx
import { debounce } from 'lodash'

const debouncedSearch = debounce((query) => {
  searchAPI(query)
}, 300)
```

### XSS Prevention

- React escapes content by default
- Never use `dangerouslySetInnerHTML` without sanitization
- Sanitize user input before rendering

```tsx
// ✅ GOOD - React escapes automatically
<div>{userInput}</div>

// ❌ BAD - Potential XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## Monitoring & Operations

### Error Reporting

**Sentry Integration**

```bash
npm install @sentry/react
```

```tsx
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
})

// Wrap app
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

**Manual Error Tracking**
```tsx
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'banners' },
    extra: { userId: user.id },
  })
  showToast('error', 'Operation failed')
}
```

### Health Checks

**Periodic Health Ping**
```tsx
// src/hooks/useHealthCheck.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await apiClient.health.status()
      return data
    },
    refetchInterval: 30000, // Every 30s
    retry: 3,
    onError: (error) => {
      console.error('Health check failed:', error)
      // Alert user if API is down
    },
  })
}
```

**Health Check Endpoint**
```
GET ${VITE_API_BASE}/api/health

Response:
{
  "status": "ok",
  "timestamp": 1234567890,
  "services": {
    "database": "connected",
    "redis": "connected",
    "bot": "online"
  }
}
```

### Feature Flags

**Environment-Based Flags**
```tsx
// .env
VITE_FEATURE_BROADCASTS=true
VITE_FEATURE_ANALYTICS=false

// src/lib/features.ts
export const features = {
  broadcasts: import.meta.env.VITE_FEATURE_BROADCASTS === 'true',
  analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  minecraft: import.meta.env.VITE_FEATURE_MINECRAFT === 'true',
}

// Usage
import { features } from '@/lib/features'

{features.broadcasts && <BroadcastsLink />}
```

**Runtime Feature Flags**
```tsx
// Fetch from API
const { data: flags } = useQuery({
  queryKey: ['feature-flags'],
  queryFn: () => apiClient.get('/feature-flags'),
})

// Use in components
{flags?.broadcasts && <BroadcastsPage />}
```

### Performance Monitoring

**Web Vitals**
```tsx
import { onCLS, onFID, onLCP } from 'web-vitals'

onCLS(console.log)
onFID(console.log)
onLCP(console.log)

// Send to analytics
onLCP((metric) => {
  analytics.track('LCP', metric.value)
})
```

**React Query DevTools**
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools />}
</QueryClientProvider>
```

### Logging

**Structured Logging**
```tsx
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: Date.now() }))
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, ...meta, timestamp: Date.now() }))
    Sentry.captureException(error)
  },
}

// Usage
logger.info('User logged in', { userId: user.id })
logger.error('API call failed', error, { endpoint: '/banners' })
```

### Analytics

**Track User Actions**
```tsx
// src/lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: any) => {
    if (import.meta.env.PROD) {
      // Send to analytics service
      console.log('Analytics:', event, properties)
    }
  },
}

// Usage
analytics.track('banner_created', { guildId, bannerType: 'welcome' })
analytics.track('page_view', { path: location.pathname })
```

---

## Deployment Checklist

### Pre-Production

- [ ] All secrets moved to environment variables
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] Secure cookies enabled
- [ ] CORS restricted to production domain
- [ ] Error reporting configured (Sentry)
- [ ] Health checks implemented
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] Accessibility audit passed
- [ ] Performance budget met (< 3s LCP)

### Production

- [ ] Environment variables set
- [ ] SSL certificate valid
- [ ] CDN configured for static assets
- [ ] Database backups automated
- [ ] Monitoring alerts configured
- [ ] Feature flags tested
- [ ] Rollback plan documented
- [ ] Load testing completed

### Post-Deployment

- [ ] Health check passing
- [ ] Error rate < 1%
- [ ] Response time < 500ms p95
- [ ] No console errors
- [ ] Analytics tracking
- [ ] User feedback collected

---

## Contact

For security issues, contact: security@yourdomain.com

For accessibility issues, contact: accessibility@yourdomain.com
