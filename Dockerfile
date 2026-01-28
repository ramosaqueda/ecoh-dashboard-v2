# Dockerfile - ECOH Dashboard
# Con todas las variables NEXT_PUBLIC_* para build time
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat curl openssl

# Crear usuario y grupo
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ====================================
# Etapa de dependencias
# ====================================
FROM base AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (todas, incluidas dev)
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

# ====================================
# Variables de entorno para BUILD TIME
# Todas las NEXT_PUBLIC_* se "hornean" en el código JS
# ====================================
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Clerk Authentication
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL

ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL

ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL

ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# URLs de la aplicación
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_ECOHLINK
ENV NEXT_PUBLIC_ECOHLINK=$NEXT_PUBLIC_ECOHLINK

# Build de la aplicación
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

# Cambiar ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]