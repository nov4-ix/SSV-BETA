# 🌌 SON1KVERS3 BACKEND - Development Setup

## 🚀 Quick Start

### 1. Instalar Dependencias
```bash
cd apps/backend
npm install
```

### 2. Configurar Base de Datos
```bash
# Instalar PostgreSQL y Redis localmente
# O usar Docker:
docker-compose up -d postgres redis

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar Prisma
```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar base de datos con datos de prueba
npm run db:seed
```

### 4. Iniciar Desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 🧪 Testing

### Tests Unitarios
```bash
npm run test
```

### Tests con Coverage
```bash
npm run test:coverage
```

### Tests de Integración
```bash
npm run test:integration
```

## 🔧 Scripts Disponibles

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Build para producción
- `npm run start` - Ejecutar en producción
- `npm run test` - Tests unitarios
- `npm run test:coverage` - Tests con coverage
- `npm run lint` - ESLint
- `npm run lint:fix` - Fix ESLint
- `npm run type-check` - TypeScript check
- `npm run db:generate` - Generar Prisma client
- `npm run db:migrate` - Migraciones
- `npm run db:seed` - Poblar DB
- `npm run db:studio` - Prisma Studio

## 🌐 Endpoints de Desarrollo

### Health Check
```bash
curl http://localhost:3001/health
```

### Analytics de Clientes
```bash
curl http://localhost:3001/api/analytics/clients
```

### Analytics de Tokens
```bash
curl http://localhost:3001/api/analytics/tokens
```

## 🐳 Docker Development

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f backend
```

### Parar servicios
```bash
docker-compose down
```

## 📊 Prisma Studio

Para visualizar y editar la base de datos:
```bash
npm run db:studio
```

Abre `http://localhost:5555`

## 🔍 Debugging

### Logs
Los logs se guardan en `logs/` directory:
- `error.log` - Errores
- `combined.log` - Todos los logs

### Variables de Entorno
```bash
# Desarrollo
NODE_ENV=development
LOG_LEVEL=debug

# Producción
NODE_ENV=production
LOG_LEVEL=info
```

## 🚀 Deployment

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
docker run -p 3001:3001 son1kvers3-backend
```

## 🎯 Usuarios de Prueba

Después de ejecutar `npm run db:seed`:

### Admin
- **Email**: `admin@son1kvers3.com`
- **Password**: `admin123`
- **Tier**: Enterprise

### Testers
- **Email**: `tester1@son1kvers3.com`
- **Password**: `tester123`
- **Tier**: Pro + Alvae Symbol

### Demo Users
- **Email**: `demo@son1kvers3.com`
- **Password**: `demo123`
- **Tier**: Free (5 generaciones totales)

## 🔧 Troubleshooting

### Error de conexión a DB
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Verificar variables de entorno
cat .env | grep DATABASE_URL
```

### Error de Redis
```bash
# Verificar que Redis esté corriendo
docker-compose ps redis

# Verificar conexión
redis-cli ping
```

### Error de Prisma
```bash
# Regenerar cliente
npm run db:generate

# Resetear base de datos
npm run db:migrate:reset
npm run db:seed
```

## 📈 Performance

### Optimizaciones
- Connection pooling para PostgreSQL
- Redis caching
- Rate limiting
- Compression gzip

### Monitoreo
- Health check endpoint
- Analytics endpoints
- Logs estructurados
- Error tracking

¡Backend listo para desarrollo! 🚀
