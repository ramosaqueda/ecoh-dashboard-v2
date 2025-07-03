# Dockerfile optimizado para docker-compose
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat curl openssl

# Crear usuario y grupo temprano
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ====================================
# Etapa de dependencias
# ====================================
FROM base AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# ====================================
# Etapa de construcción
# ====================================
FROM base AS builder
WORKDIR /app

# Copiar node_modules desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos del proyecto
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Build de la aplicación
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ====================================
# Etapa de producción
# ====================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Cambiar ownership SOLO después de copiar todo
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]