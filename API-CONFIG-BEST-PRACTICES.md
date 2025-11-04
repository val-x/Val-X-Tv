# API Configuration Best Practices - api.val-x.com

## Overview

This guide covers best practices for configuring the Val-X Originals API at `https://api.val-x.com/` based on latest Hono.js, Bun, and production deployment standards.

## Current Configuration Status

✅ **Implemented:**
- Health check endpoint (`/health`)
- CORS with wildcard subdomain support
- Rate limiting (in-memory)
- Response compression
- Error handling
- JWT authentication

⚠️ **Can Be Improved:**
- Security headers
- Trusted proxy configuration
- Request ID tracking
- Structured logging
- Better rate limiting (Redis-based)

## 1. Security Headers

### Recommended Security Headers

Add security headers to protect against common vulnerabilities:

```javascript
// In gateway.js, add security headers middleware
app.use('*', async (c, next) => {
  await next();
  
  // Security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (if using HTTPS - Coolify handles this)
  // Strict-Transport-Security: max-age=31536000; includeSubDomains
  
  // Remove server header (optional - helps hide server info)
  // Bun doesn't expose server header by default
});
```

### Content Security Policy (CSP)

For APIs, CSP is usually not needed, but if serving HTML:
```javascript
c.header('Content-Security-Policy', "default-src 'self'");
```

## 2. Trusted Proxy Configuration

When behind reverse proxy (Coolify/Traefik), configure trusted proxies:

```javascript
// Hono.js doesn't have built-in trusted proxy, but we can handle X-Forwarded-* headers
app.use('*', async (c, next) => {
  // Trust X-Forwarded-For from Coolify proxy
  const forwardedFor = c.req.header('x-forwarded-for');
  const realIp = c.req.header('x-real-ip');
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const host = c.req.header('x-forwarded-host') || c.req.header('host');
  
  // Store for logging/rate limiting
  c.set('clientIp', forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown');
  c.set('protocol', protocol);
  c.set('host', host);
  
  await next();
});
```

## 3. Rate Limiting Improvements

### Current Implementation
- ✅ In-memory rate limiting
- ✅ IP-based (using X-Forwarded-For)
- ✅ Configurable via environment variables

### Recommended for Production

**Option 1: Redis-based (Recommended for scale)**
```javascript
// Use Redis for distributed rate limiting
// Allows rate limiting across multiple instances
```

**Option 2: Keep In-Memory (Current - OK for single instance)**
- ✅ Works for single server deployment
- ✅ Simple and fast
- ⚠️ Resets on restart
- ⚠️ Doesn't work across multiple instances

**Current Settings:**
- `RATE_LIMIT_WINDOW=60000` (1 minute)
- `RATE_LIMIT_MAX=100` (100 requests per minute)

**Recommendation:** Current implementation is fine for single-server deployment. Consider Redis if scaling horizontally.

## 4. CORS Configuration

### Current Implementation
```javascript
CORS_ORIGIN=https://*.val-x.com,https://val-x.com
```

### Best Practices
✅ **Wildcard subdomain support** - Already implemented
✅ **Credentials support** - Already enabled
✅ **Explicit methods/headers** - Already configured

### Additional Recommendations

```javascript
// Add CORS preflight caching
app.use('*', cors({
  origin: (origin) => { /* ... */ },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
  exposeHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}));
```

## 5. Health Check Configuration

### Current Implementation
✅ Health endpoint at `/health`
✅ Returns status, uptime, memory usage

### Recommended Enhancements

```javascript
app.get('/health', async (c) => {
  // Check dependencies
  const minioHealthy = await checkMinIOHealth();
  
  return c.json({ 
    status: minioHealthy ? 'ok' : 'degraded',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      limit: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    dependencies: {
      minio: minioHealthy ? 'ok' : 'unhealthy',
    },
    version: '1.0.0'
  }, minioHealthy ? 200 : 503);
});

async function checkMinIOHealth() {
  try {
    const response = await fetch('http://minio:9000/minio/health/live');
    return response.ok;
  } catch {
    return false;
  }
}
```

## 6. Request ID Tracking

Add request ID for better logging and debugging:

```javascript
import { randomUUID } from 'crypto';

app.use('*', async (c, next) => {
  const requestId = randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);
  
  await next();
});
```

## 7. Structured Logging

### Current: Console.log
```javascript
console.error('Error:', err);
```

### Recommended: Structured Logging
```javascript
const logger = {
  info: (msg, data) => console.log(JSON.stringify({ level: 'info', msg, ...data, timestamp: new Date().toISOString() })),
  error: (msg, err, data) => console.error(JSON.stringify({ level: 'error', msg, error: err.message, stack: err.stack, ...data, timestamp: new Date().toISOString() })),
  warn: (msg, data) => console.warn(JSON.stringify({ level: 'warn', msg, ...data, timestamp: new Date().toISOString() })),
};
```

## 8. Error Handling

### Current Implementation
✅ Basic error handling
✅ 404 handler

### Recommended Enhancements

```javascript
app.onError((err, c) => {
  const requestId = c.get('requestId') || 'unknown';
  const errorId = randomUUID();
  
  // Log error with context
  logger.error('Request error', err, {
    requestId,
    errorId,
    path: c.req.path,
    method: c.req.method,
  });
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? err.message : 'Internal server error';
  
  return c.json({ 
    error: 'Internal server error',
    message,
    errorId, // For support/debugging
    requestId,
  }, 500);
});
```

## 9. Docker Configuration

### Current Health Check
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

✅ **Good**: Uses `/health` endpoint
✅ **Good**: Reasonable intervals
⚠️ **Fixed**: Added `curl` to Dockerfile

## 10. Coolify/Traefik Configuration

### Domain Configuration
In Coolify Dashboard:
- **Domain**: `api.val-x.com`
- **Service**: `valx-api`
- **Port**: `8080`
- **HTTPS**: Enabled (Let's Encrypt)
- **Path**: `/` (root)

### Traefik Labels (if needed)
```yaml
labels:
  - traefik.http.services.valx-api.loadbalancer.server.port=8080
  - traefik.http.routers.valx-api.rule=Host(`api.val-x.com`)
  - traefik.http.routers.valx-api.entrypoints=websecure
  - traefik.http.routers.valx-api.tls.certresolver=letsencrypt
```

**Note**: Coolify handles routing automatically, labels may not be needed.

## 11. Environment Variables

### Required
```env
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=<your-key>
MINIO_SECRET_KEY=<your-secret>
JWT_SECRET=<strong-secret>
PORT=8080
CORS_ORIGIN=https://*.val-x.com,https://val-x.com
```

### Optional but Recommended
```env
NODE_ENV=production
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
MAX_UPLOAD_SIZE=10737418240
JWT_EXPIRES_IN=7d
```

## 12. Performance Optimizations

### Response Compression
✅ Already enabled: `app.use('*', compress())`

### Connection Pooling
- MinIO client should handle connection pooling
- Consider connection limits if experiencing issues

### Memory Management
- Monitor memory usage via `/health` endpoint
- Set appropriate Docker memory limits (currently 4GB max)

## 13. Monitoring & Observability

### Recommended Metrics
- Request rate (requests/second)
- Error rate (errors/second)
- Response time (p50, p95, p99)
- Memory usage
- MinIO connectivity

### Health Check Monitoring
- Monitor `/health` endpoint
- Alert on 503 responses
- Track dependency health (MinIO)

## 14. Security Checklist

- [x] HTTPS enforced (Coolify handles)
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] JWT authentication
- [x] Input validation (via Zod schemas)
- [ ] Security headers (recommended to add)
- [ ] Request ID tracking (recommended)
- [ ] Structured logging (recommended)
- [ ] Error sanitization (recommended)

## 15. Recommended Improvements

### High Priority
1. **Add security headers** - Protect against XSS, clickjacking, etc.
2. **Add request ID** - Better debugging and tracing
3. **Improve error handling** - Don't expose stack traces in production

### Medium Priority
4. **Structured logging** - Better log analysis
5. **Enhanced health check** - Check MinIO connectivity
6. **Trusted proxy handling** - Better IP detection

### Low Priority (Future)
7. **Redis rate limiting** - For horizontal scaling
8. **Metrics endpoint** - Prometheus-compatible metrics
9. **Request/response logging** - For debugging

## Implementation Examples

See `functions/gateway.js` for current implementation and apply recommended improvements as needed.

## References

- [Hono.js Documentation](https://hono.dev/)
- [Bun Documentation](https://bun.sh/docs)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Coolify Documentation](https://coolify.io/docs)

