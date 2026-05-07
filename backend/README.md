# TiffinBD Backend

A comprehensive NestJS-based backend for the TiffinBD order management system. Handles order ingestion, normalization, processing, and multi-branch management.

## Features

- **Multi-Branch Management**: Support for multiple branches with role-based access control
- **Order Ingestion & Normalization**: Automated ingestion and normalization of orders from multiple sources
- **JWT Authentication**: Secure API authentication with JWT tokens
- **Real-time Notifications**: Order status notifications across multiple channels
- **Analytics & Reporting**: Comprehensive analytics and reporting capabilities
- **Audit Logging**: Complete audit trail of all user actions
- **Docker Deployment**: Production-ready Docker containerization

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10+
- **Language**: TypeScript (strict mode)
- **Database**: MySQL 8.0+ with TypeORM
- **Cache**: Redis 7+
- **Logging**: Bunyan with structured JSON output
- **Testing**: Jest with property-based testing
- **Build**: TypeScript compiler with ESLint and Prettier

## Prerequisites

- Node.js 18+ or Docker
- Docker and Docker Compose (for containerized deployment)
- MySQL 8.0+ or use included Docker MySQL container
- Redis 7+ or use included Docker Redis container

## Installation

### Local Development (without Docker)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Services** (MySQL and Redis must be running)
   ```bash
   npm run start:dev
   ```

### Docker Deployment

1. **Build and Start**
   ```bash
   docker-compose up -d
   ```

2. **Verify Services**
   ```bash
   # Check backend health
   curl http://localhost:3000/health
   
   # Check liveness
   curl http://localhost:3000/health/live
   
   # Check readiness
   curl http://localhost:3000/health/ready
   ```

3. **Stop Services**
   ```bash
   docker-compose down
   ```

## Available Scripts

```bash
# Development
npm run start:dev        # Start in watch mode with auto-reload

# Production
npm run build            # Build TypeScript
npm run start            # Start production server
npm start                # Alias for start

# Testing
npm test                 # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

## Environment Variables

See `.env.example` for all available configuration options:

### Core Configuration
- `NODE_ENV` - Environment (development, staging, production)
- `APP_PORT` - Application port (default: 3000)
- `APP_NAME` - Application name
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

### Database
- `DATABASE_HOST` - MySQL host
- `DATABASE_PORT` - MySQL port (default: 3306)
- `DATABASE_USERNAME` - MySQL username
- `DATABASE_PASSWORD` - MySQL password
- `DATABASE_NAME` - Database name

### Redis
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)

### Authentication
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - JWT expiration time in seconds
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration

## Project Structure

```
backend/
├── src/
│   ├── modules/                    # Feature modules
│   │   ├── auth/                   # Authentication
│   │   ├── users/                  # User management
│   │   ├── branches/               # Branch management
│   │   ├── ingestion/              # Order ingestion
│   │   ├── normalization/          # Order normalization
│   │   ├── orders/                 # Order processing
│   │   ├── notifications/          # Notifications
│   │   ├── escalation/             # Issue escalation
│   │   ├── analytics/              # Analytics & reporting
│   │   └── printing/               # Printing service
│   ├── database/                   # Database layer
│   │   ├── entities/               # TypeORM entities
│   │   ├── repositories/           # Data repositories
│   │   ├── migrations/             # Database migrations
│   │   └── seeds/                  # Seed data
│   ├── common/                     # Shared utilities
│   │   ├── exceptions/             # Custom exceptions
│   │   ├── guards/                 # Auth guards
│   │   ├── decorators/             # Custom decorators
│   │   ├── interceptors/           # Request interceptors
│   │   ├── logger/                 # Logging service
│   │   ├── constants/              # App constants
│   │   └── utils/                  # Helper utilities
│   ├── config/                     # Configuration
│   ├── health/                     # Health check endpoints
│   ├── app.module.ts               # Root module
│   └── main.ts                     # Application entry point
├── docker/                         # Docker configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── jest.config.js                  # Test config
└── docker-compose.yml              # Docker Compose config
```

## Database Schema

### Core Entities
- **Branches** - Business branches
- **Roles** - User roles with permissions
- **Users** - System users
- **UserBranchRoles** - User-Branch-Role mappings
- **Devices** - Order submission devices
- **SourceConnectors** - External data sources

### Order Management
- **RawOrders** - Ingested raw order data
- **NormalizedOrders** - Processed normalized orders
- **NormalizationErrors** - Error tracking

### Operations
- **AuditLogs** - User action audit trail

## API Endpoints

### Health Checks
- `GET /health` - Full health check
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Authentication (Module: Auth)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout

### Users (Module: Users)
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Branches (Module: Branches)
- `GET /branches` - List branches
- `GET /branches/:id` - Get branch details
- `POST /branches` - Create branch
- `PATCH /branches/:id` - Update branch

### Orders (Module: Orders)
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PATCH /orders/:id` - Update order status

### Notifications (Module: Notifications)
- `GET /notifications` - List notifications
- `POST /notifications/send` - Send notification

## Security Considerations

1. **Environment Secrets**: All sensitive data (JWT secret, DB password, etc.) must be in environment variables
2. **Database Security**: Use parameterized queries (TypeORM default)
3. **CORS**: Configure allowed origins based on deployment environment
4. **Rate Limiting**: Implement throttling for production (Week 2 task)
5. **Non-root Docker User**: Application runs as non-root (nodejs) user
6. **Password Hashing**: All passwords are hashed using bcrypt
7. **SQL Injection Prevention**: TypeORM prevents SQL injection by default

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/modules/auth/auth.service.spec.ts

# Generate coverage report
npm run test:cov
```

## Debugging

### Local Development
```bash
# Start with Node debugger
node --inspect=0.0.0.0:9229 dist/main.js

# Debug in VS Code
# Use the debug configuration in .vscode/launch.json
```

### Docker Debugging
```bash
# View logs
docker-compose logs -f backend

# Shell into container
docker-compose exec backend sh

# Check container health
docker-compose ps
```

## Deployment

### Production Build
```bash
# Build Docker image
docker build -f docker/Dockerfile -t tiffin-bd-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_HOST=mysql-prod \
  -e DATABASE_USERNAME=prod_user \
  -e DATABASE_PASSWORD=prod_pass \
  -e JWT_SECRET=your-production-secret \
  tiffin-bd-backend:latest
```

### Environment-Specific Configuration
- Development: `.env.local` or `.env`
- Staging: `.env.staging`
- Production: `.env.production` (use CI/CD secrets)

## Contributing

1. Follow TypeScript strict mode guidelines
2. Write tests for new features (required)
3. Use property-based testing for business logic transformations
4. Run linting and formatting before committing
5. Keep commits focused and include descriptive messages

## Week 1 Completion

This backend initialization completes Week 1 requirements:

- ✅ NestJS project setup with TypeScript strict mode
- ✅ MySQL 8.0 database with 10 core entities and repositories
- ✅ JWT authentication framework with guards and decorators
- ✅ Redis integration ready (Week 2)
- ✅ Structured logging with Bunyan
- ✅ 10 feature module scaffolding
- ✅ Health check endpoints (liveness, readiness, full health)
- ✅ Docker containerization with multi-stage builds
- ✅ ESLint and Prettier code quality tools
- ✅ Jest test framework setup
- ✅ Security baseline enabled (non-root Docker user, parameterized queries)
- ✅ Property-based testing extension enabled

## Next Steps (Week 2+)

- Implement Auth module (login, registration, JWT flow)
- Implement Users CRUD operations
- Implement Branch management with access control
- Setup data ingestion pipeline
- Implement order normalization logic
- Configure Redis caching layer
- Add rate limiting and throttling
- Implement notification channels
- Setup CI/CD pipeline
- Add comprehensive API documentation

## Support & Issues

For issues or questions:
1. Check existing documentation in `context/` folder
2. Review Week 1 planning in `WEEKLY_PROJECT_PLAN.md`
3. Check AI-DLC documentation in `.aidlc/` folder

## License

TiffinBD © 2024
