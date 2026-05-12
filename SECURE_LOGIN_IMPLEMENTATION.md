# Secure Login Implementation Guide

## Overview
This guide provides a complete implementation of a secure login page with CSRF protection, rate limiting, and DDoS mitigation for the TiffinBD application.

## Super Admin Credentials

### Default Super Admin Account
After seeding, use these credentials to login:

```
Email: admin@tiffinbd.local
Username: admin
Password: SecureAdminPass123!
Full Name: Super Administrator
```

**⚠️ IMPORTANT:** Change this password immediately after first login!

## Seeding Super Admin

To create the super admin user in your database:

```bash
# Using npm script
cd backend
npm run seed:super-admin

# Or with custom environment variables
SUPER_ADMIN_EMAIL=custom@admin.com \
SUPER_ADMIN_USERNAME=customadmin \
SUPER_ADMIN_PASSWORD=CustomPassword123! \
SUPER_ADMIN_FULLNAME="Custom Admin Name" \
npm run seed:super-admin
```

## Security Features Implemented

### 1. **CSRF Protection** ✅
- **Token Generation**: HMAC-SHA256 signed tokens with session tracking
- **Token Validation**: Double-submit pattern (header + body)
- **Expiry**: 24-hour token lifetime with automatic cleanup
- **One-time Use**: Tokens are consumed after use

**Endpoint**: `GET /auth/csrf-token`
```bash
curl -X GET http://localhost:3001/auth/csrf-token \
  -H "x-session-id: your-session-id"

# Response:
{
  "statusCode": 200,
  "data": {
    "csrfToken": "abc123def456ghi789...",
    "sessionId": "session-1234567890"
  }
}
```

### 2. **Rate Limiting (DDoS Protection)** ✅
- **General Limit**: 100 requests per IP per 15 minutes
- **Login Endpoint Limit**: 5 attempts per IP per 15 minutes
- **Auto-Lockout**: 15-minute lockout after 5 failed attempts
- **Response Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Rate Limit Response** (429 Too Many Requests):
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

### 3. **Password Security** ✅
- **Hashing**: bcrypt with SALT_ROUNDS=12
- **Never Stored**: Plain text passwords never stored in database
- **Comparison**: Secure timing-safe comparison via bcrypt.compare()

### 4. **Session Management** ✅
- **Session ID**: Generated and tracked per login attempt
- **Storage**: In localStorage on client side
- **Headers**: Sent via `x-session-id` header in all auth requests

### 5. **JWT Authentication** ✅
- **Access Token**: Short-lived (1 hour by default)
- **Refresh Token**: Long-lived (7 days by default)
- **Payload**: Includes user ID, username, isSuperAdmin flag, roles, branch IDs
- **Verification**: Automatic on protected routes

## API Endpoints

### Login
```bash
POST /auth/login
Content-Type: application/json
x-csrf-token: <csrf-token>
x-session-id: <session-id>

Request Body:
{
  "username": "admin",
  "password": "SecureAdminPass123!",
  "csrfToken": "<csrf-token>"
}

Response (200 OK):
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid-here",
      "username": "admin",
      "email": "admin@tiffinbd.local",
      "fullName": "Super Administrator",
      "isSuperAdmin": true,
      "isActive": true
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "<refresh-token>"
}

Response (200 OK):
{
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Get CSRF Token
```bash
GET /auth/csrf-token
x-session-id: <session-id>

Response (200 OK):
{
  "statusCode": 200,
  "data": {
    "csrfToken": "abc123def456...",
    "sessionId": "session-1234567890"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Frontend Login Implementation

### React Component Setup

```bash
# Install dependencies
npm install react axios react-router-dom

# Create component
touch src/pages/Login.tsx
```

### Key Implementation Details

1. **CSRF Token Fetching**:
   - Generate unique session ID on mount
   - Fetch CSRF token from backend
   - Store both in state and localStorage

2. **Form Submission**:
   - Validate inputs before sending
   - Include CSRF token in both headers and body
   - Include session ID in headers
   - Handle rate limiting (429 status code)

3. **Token Storage**:
   - Store `accessToken` in localStorage
   - Store `refreshToken` in localStorage
   - Store `user` info for display
   - Store `expiresIn` for token refresh timing

4. **Error Handling**:
   - 400: CSRF token invalid or credentials invalid
   - 401: Invalid credentials
   - 429: Rate limited - show lockout countdown
   - Connection errors: Show friendly message

5. **Lockout UI**:
   - Show countdown timer when rate limited
   - Disable form inputs during lockout
   - Display remaining lockout time
   - Auto-clear lockout on expiry

### Environment Variables

```bash
# .env
REACT_APP_API_URL=http://localhost:3001
```

## Configuration Files

### Backend Environment (.env.local)

```bash
# CSRF
CSRF_SECRET=csrf-secret-key-change-in-production-very-long-random-string-here

# Super Admin (for seeding)
SUPER_ADMIN_EMAIL=admin@tiffinbd.local
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=SecureAdminPass123!
SUPER_ADMIN_FULLNAME=Super Administrator

# JWT
JWT_SECRET=your-secret-key-change-in-production-very-long-random-string-here
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-very-long-random-string-here
JWT_REFRESH_EXPIRATION=604800
```

## Security Headers

The application includes these security features:

- ✅ CSRF Token Validation (double-submit pattern)
- ✅ Rate Limiting (100 req/15min general, 5 attempts/15min login)
- ✅ Password Hashing (bcrypt SALT_ROUNDS=12)
- ✅ Session ID Tracking
- ✅ Secure JWT Tokens
- ✅ One-time CSRF Token Use
- ⏳ Helmet.js Security Headers (TODO)
- ⏳ HSTS Header (TODO)
- ⏳ Content Security Policy (TODO)

## Testing Checklist

- [ ] Fetch CSRF token before login
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials fails
- [ ] 5 failed attempts trigger rate limit
- [ ] Lockout message displays with countdown
- [ ] Rate limit blocks requests for 15 minutes
- [ ] CSRF token validation fails without valid token
- [ ] Tokens stored in localStorage after login
- [ ] Redirect to dashboard on successful login
- [ ] Session ID persists across requests
- [ ] Rate limit headers present in responses
- [ ] Password never logged to console
- [ ] HTTPS only in production (configure)
- [ ] Secure flag on cookies (configure)

## Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set strong CSRF_SECRET (min 32 characters)
- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Change super admin password immediately
- [ ] Enable HTTPS in production
- [ ] Configure Helmet.js for security headers
- [ ] Set up Redis for session storage (production)
- [ ] Configure email for password reset (future feature)
- [ ] Enable database SSL connection
- [ ] Set up CORS for frontend domain

## File Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── csrf/
│   │   │   ├── csrf.service.ts       # CSRF token generation/verification
│   │   │   └── csrf.guard.ts         # CSRF validation guard
│   │   └── middleware/
│   │       └── rate-limit.middleware.ts  # Rate limiting middleware
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.service.ts       # Auth logic (login, JWT, hashing)
│   │       ├── auth.controller.ts    # Auth endpoints (login, refresh, csrf-token)
│   │       └── auth.module.ts        # Auth module configuration
│   └── scripts/
│       └── seed-super-admin.ts       # Super admin seeding script
└── package.json

frontend/
├── src/
│   ├── pages/
│   │   └── Login.tsx                 # Login page component
│   ├── components/
│   │   └── ProtectedRoute.tsx        # Protected route wrapper
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

## Troubleshooting

### CSRF Token Errors
```
Error: "Security error: Invalid CSRF token"
Solution: 
- Ensure CSRF_SECRET is set in .env
- Verify token is being sent in both headers and body
- Check that sessionId is consistent across requests
```

### Rate Limiting Issues
```
Error: "Too many requests"
Solution:
- Wait 15 minutes or clear login attempts from cache
- Verify IP address is correct (check X-Forwarded-For header behind proxy)
- Check RateLimitMiddleware is properly configured
```

### Login Fails with 401
```
Error: "Invalid credentials"
Solution:
- Verify super admin was seeded: npm run seed:super-admin
- Check password matches in .env.local
- Ensure user is active in database: isActive = true
```

## Next Steps

1. ✅ CSRF protection implemented
2. ✅ Rate limiting implemented
3. ✅ Super admin seeding script created
4. ⏳ Frontend login page (see Login.tsx)
5. ⏳ Dashboard activity page
6. ⏳ Helmet.js security headers
7. ⏳ Redis-backed rate limiting (production)
8. ⏳ Password reset functionality
9. ⏳ Two-factor authentication (future)
10. ⏳ OAuth2 integration (future)

## References

- [OWASP CSRF Protection](https://owasp.org/www-community/attacks/csrf)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Hashing](https://github.com/kelektiv/node.bcrypt.js)
- [Rate Limiting](https://owasp.org/www-community/attacks/Rate_Limiting)
