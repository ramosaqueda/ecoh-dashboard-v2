-- ============================================
-- MIGRACIÓN: Permitir actividades sin causa (Actividades de Apoyo)
-- ============================================

-- PASO 1: Agregar columna para identificar actividades de apoyo
ALTER TABLE public."Actividad" 
ADD COLUMN IF NOT EXISTS "esActividadApoyo" BOOLEAN NOT NULL DEFAULT false;

-- PASO 2: Hacer el campo causa_id nullable
-- Primero, eliminar la foreign key constraint existente
ALTER TABLE public."Actividad" 
DROP CONSTRAINT IF EXISTS "Actividad_causa_id_fkey";

-- Hacer la columna causa_id nullable
ALTER TABLE public."Actividad" 
ALTER COLUMN "causa_id" DROP NOT NULL;

-- PASO 3: Recrear la foreign key constraint con la columna nullable
ALTER TABLE public."Actividad" 
ADD CONSTRAINT "Actividad_causa_id_fkey" 
FOREIGN KEY ("causa_id") 
REFERENCES public."Causa"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- PASO 4: Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS "idx_actividad_esActividadApoyo" 
ON public."Actividad"("esActividadApoyo");

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver la estructura actualizada
-- \d "Actividad"

-- Verificar que la columna existe y es nullable
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Actividad'
    AND column_name IN ('causa_id', 'esActividadApoyo');

-- Contar actividades actuales
SELECT 
    COUNT(*) as total_actividades,
    SUM(CASE WHEN "esActividadApoyo" = true THEN 1 ELSE 0 END) as actividades_apoyo,
    SUM(CASE WHEN "causa_id" IS NULL THEN 1 ELSE 0 END) as sin_causa
FROM public."Actividad";
