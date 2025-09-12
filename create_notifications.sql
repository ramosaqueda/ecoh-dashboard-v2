-- ============================================
-- CREAR SISTEMA DE NOTIFICACIONES - SQL DIRECTO
-- Ejecutar en tu base de datos PostgreSQL
-- ============================================

-- 1. CREAR ENUMS PARA NOTIFICACIONES
-- ============================================

-- Enum para tipos de notificación
CREATE TYPE "NotificationType" AS ENUM (
    'actividad_asignada',
    'estado_cambiado', 
    'nueva_causa',
    'sistema'
);

-- Enum para prioridades de notificación
CREATE TYPE "NotificationPriority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- 2. CREAR TABLA NOTIFICATIONS
-- ============================================

CREATE TABLE "notifications" (
    "id" VARCHAR(255) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "userId" INTEGER NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 3. CREAR FOREIGN KEY CON USUARIOS
-- ============================================

ALTER TABLE "notifications" 
ADD CONSTRAINT "notifications_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "usuarios"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índice para búsquedas por usuario (principal)
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- Índice para búsquedas por email (queries rápidas)
CREATE INDEX "notifications_userEmail_idx" ON "notifications"("userEmail");

-- Índice para ordenamiento por fecha
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- Índice para filtrar no leídas
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- Índice para filtrar por tipo
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- Índice para filtrar por prioridad
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- Índice compuesto para queries comunes (usuario + no leídas)
CREATE INDEX "notifications_userId_read_createdAt_idx" 
ON "notifications"("userId", "read", "createdAt" DESC);

-- Índice compuesto para cleanup automático
CREATE INDEX "notifications_expiresAt_idx" 
ON "notifications"("expiresAt") 
WHERE "expiresAt" IS NOT NULL;

-- 5. VERIFICAR CREACIÓN
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;