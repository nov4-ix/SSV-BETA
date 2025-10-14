# 🌌 SON1KVERS3 BACKEND

Backend API completo para Son1kVers3 ALFA-SSV con Node.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Características

- **🔐 Autenticación OAuth2** (Google, Facebook, TikTok)
- **🪙 Sistema de Tokens Compartidos** con clientes únicos
- **🎵 Generación Musical** con Suno AI
- **💳 Pagos** con Stripe
- **🌐 Tracking de Clientes** únicos por navegador
- **📊 Analytics** completas
- **🛡️ Seguridad** con Helmet, CORS, Rate Limiting
- **🔄 Cola de Trabajos** con BullMQ
- **💬 Chat Real-time** con Socket.io

## 🏗️ Arquitectura

```
apps/backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Controladores de API
│   │   ├── middlewares/    # Middlewares
│   │   ├── routes/         # Rutas de API
│   │   └── validators/     # Validadores
│   ├── services/
│   │   ├── auth/          # Servicios de autenticación
│   │   ├── music/         # Servicios de música
│   │   ├── tokens/        # Sistema de tokens
│   │   ├── tools/         # Herramientas (downloads, shares)
│   │   └── analytics/     # Analytics y tracking
│   ├── database/
│   │   ├── prisma/        # Schema de Prisma
│   │   └── migrations/    # Migraciones
│   ├── config/            # Configuración
│   └── utils/             # Utilidades
├── netlify/functions/     # Netlify Functions
├── docker-compose.yml     # Docker Compose
├── Dockerfile            # Docker
└── nginx.conf            # Nginx
```

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 20+ + TypeScript
- **Framework**: Express.js 4.18+
- **ORM**: Prisma 5.8+ con PostgreSQL 16
- **Cache**: Redis 7+
- **Queue**: BullMQ
- **Real-time**: Socket.io 4.6+
- **Auth**: JWT + OAuth2
- **Payments**: Stripe
- **AI**: Suno API
- **Security**: Helmet, CORS, Rate Limiting

## 📊 Sistema de Tiers

### FREE TIER 🆓
- **Generaciones totales**: 5 (3 modelo 3.5 + 2 modelo 5)
- **Descargas**: 0
- **Compartir**: 5 (solo con marca de agua)
- **Herramientas**: Solo Pixel Basic

### PRO TIER ⚡
- **Generaciones diarias**: 4
- **Descargas diarias**: 10
- **Compartir diario**: 5
- **Herramientas**: Music Generator, Ghost Studio, Nova Post

### PREMIUM TIER 👑
- **Generaciones diarias**: 5
- **Descargas diarias**: 25
- **Compartir diario**: 15
- **Herramientas**: Todas + Nexus Mode

### ENTERPRISE TIER 🏢
- **Generaciones**: Ilimitadas
- **Descargas**: Ilimitadas
- **Compartir**: Ilimitadas
- **Herramientas**: Todas + Admin Panel

## 🪙 Sistema de Tokens Compartidos

### Pool Dinámico
- **Base diaria**: 1000 FREE + 2000 PAID
- **Clientes únicos**: +70% FREE + 30% PAID
- **Ejemplo**: 100 clientes = 1700 FREE + 2300 PAID

### Asignación por Tier
- **FREE**: 5 tokens (5 free + 0 paid)
- **PRO**: 4 tokens (2 free + 2 paid)
- **PREMIUM**: 5 tokens (1 free + 4 paid)
- **ENTERPRISE**: 100 tokens (0 free + 100 paid)

## 🌐 Tracking de Clientes Únicos

Cada instalación de navegador es un cliente único que:
- Genera fingerprint único (User Agent + IP + Timestamp)
- Contribuye 10 tokens al pool diario
- Se distribuye: 70% FREE + 30% PAID
- Se trackea por país, ciudad y actividad

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env

# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar base de datos
npm run db:seed

# Iniciar desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo
npm run build        # Build
npm run start        # Producción
npm run test         # Tests
npm run test:coverage # Tests con coverage
npm run lint         # ESLint
npm run lint:fix     # Fix ESLint
npm run type-check   # TypeScript check
npm run db:generate  # Generar Prisma client
npm run db:migrate   # Migraciones
npm run db:seed      # Poblar DB
npm run db:studio    # Prisma Studio
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up -d
```

### Producción
```bash
docker build -t son1kvers3-backend .
docker run -p 3001:3001 son1kvers3-backend
```

## 🌐 Deployment

### Netlify Functions
```bash
npm run build
netlify deploy --prod
```

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t son1kvers3-backend .
docker push ghcr.io/username/son1kvers3-backend
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Perfil de usuario

### Generación Musical
- `POST /api/generations` - Crear generación
- `GET /api/generations/:id` - Estado de generación
- `GET /api/generations` - Lista de generaciones

### Analytics
- `GET /api/analytics/clients` - Stats de clientes
- `GET /api/analytics/tokens` - Stats de tokens
- `GET /api/analytics/overview` - Vista general

### Health Check
- `GET /health` - Estado del servidor

## 🔧 Variables de Entorno

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/son1kvers3"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-at-least-32-characters-long"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"

# Suno AI
SUNO_API_KEY="Bearer your-suno-api-key"
SUNO_BASE_URL="https://ai.imgkits.com/suno"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests de integración
npm run test:integration
```

## 📊 Monitoreo

- **Logs**: Winston con niveles configurables
- **Health Check**: Endpoint `/health`
- **Metrics**: Analytics endpoints
- **Error Tracking**: Sentry (opcional)

## 🔒 Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configuración de origen
- **Rate Limiting**: Límites por IP
- **JWT**: Tokens seguros
- **Input Validation**: Zod schemas
- **SQL Injection**: Prisma ORM

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎵 Son1kVers3 ALFA-SSV

Democratizando la música con IA, una generación a la vez! 🎵
