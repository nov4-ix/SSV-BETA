# 🌌 SON1KVERS3 BACKEND - Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 son1kvers3

# Copy built application
COPY --from=builder --chown=son1kvers3:nodejs /app/dist ./dist
COPY --from=builder --chown=son1kvers3:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=son1kvers3:nodejs /app/package.json ./package.json
COPY --from=builder --chown=son1kvers3:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs && chown son1kvers3:nodejs logs

USER son1kvers3

EXPOSE 3001

ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["node", "dist/server.js"]
