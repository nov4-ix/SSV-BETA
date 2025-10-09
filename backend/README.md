# Son1kvers3 Backend

## 🎵 Professional AI Music Generation Platform

Backend API for Son1kvers3 - A professional platform for AI-powered music generation.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL 16+
- Redis 7+
- npm 10+

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment setup:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Database setup:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                 # API layer
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/          # Route definitions
│   │   └── validators/      # Input validation schemas
│   ├── services/            # Business logic
│   │   ├── auth/           # Authentication services
│   │   ├── music/           # Music generation services
│   │   ├── ai/              # AI integration services
│   │   ├── storage/         # File storage services
│   │   └── notification/    # Notification services
│   ├── database/            # Data layer
│   │   ├── models/          # Prisma models
│   │   ├── repositories/   # Data access layer
│   │   └── migrations/      # Database migrations
│   ├── workers/             # Background job processors
│   ├── queue/               # Job queue management
│   ├── websocket/           # Real-time communication
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── tests/                   # Test files
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
└── prisma/                  # Database schema and migrations
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## 🔧 Configuration

### Environment Variables

See `env.example` for all available configuration options.

### Key Configuration Areas:

- **Database**: PostgreSQL connection string
- **Redis**: Redis connection for caching and queues
- **JWT**: Authentication token secrets
- **AWS S3**: File storage configuration
- **AI Service**: AI model endpoint and API key
- **CORS**: Allowed origins for cross-origin requests

## 🏗️ Architecture

### Layered Architecture

1. **API Layer** (`/api`): Handles HTTP requests/responses
2. **Service Layer** (`/services`): Business logic and orchestration
3. **Repository Layer** (`/database/repositories`): Data access
4. **Worker Layer** (`/workers`): Background processing

### Key Features

- **Authentication**: JWT-based auth with refresh tokens
- **Rate Limiting**: Redis-backed rate limiting
- **File Storage**: AWS S3 integration for audio files
- **Background Jobs**: BullMQ for async processing
- **Real-time**: Socket.io for live updates
- **Validation**: Zod schemas for type-safe validation
- **Logging**: Structured logging with Pino
- **Testing**: Comprehensive test suite with Vitest

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting per endpoint
- Input validation and sanitization
- JWT token management
- File upload validation

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile

### Music Generation
- `POST /api/v1/music/generate` - Create music generation request
- `GET /api/v1/music/generations` - List user generations
- `GET /api/v1/music/generations/:id` - Get generation status
- `DELETE /api/v1/music/generations/:id` - Cancel generation

### Tracks
- `GET /api/v1/tracks` - List user tracks
- `GET /api/v1/tracks/:id` - Get track details
- `PUT /api/v1/tracks/:id` - Update track metadata
- `DELETE /api/v1/tracks/:id` - Delete track

### Projects
- `GET /api/v1/projects` - List user projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- tests/auth.test.ts
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t son1kvers3-backend .

# Run with docker-compose
docker-compose up -d
```

### Environment Setup

1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure AWS S3 bucket
4. Set environment variables
5. Run migrations: `npm run db:migrate`
6. Start server: `npm start`

## 📝 Contributing

1. Follow the coding standards defined in `.cursorrules`
2. Write tests for new features
3. Use conventional commits
4. Run linting and type checking before commits
5. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details.
