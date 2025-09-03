-- ====================================
-- SCRIPT DE ROLLBACK: ESTADO DE CAUSA
-- ====================================
-- ⚠️ CUIDADO: Este script eliminará la funcionalidad de Estados de Causa
-- Solo ejecutar si necesitas revertir completamente los cambios
-- Fecha: 2025-01-15
-- Versión: 1.0

BEGIN;

-- ====================================
-- 1. ELIMINAR FOREIGN KEY CONSTRAINT
-- ====================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'Causa_estadoCausaId_fkey') THEN
        
        ALTER TABLE "Causa" DROP CONSTRAINT "Causa_estadoCausaId_fkey";
        RAISE NOTICE 'Foreign key Causa_estadoCausaId_fkey eliminada';
    ELSE
        RAISE NOTICE 'Foreign key Causa_estadoCausaId_fkey no existe';
    END IF;
END $$;

-- ====================================
-- 2. ELIMINAR ÍNDICE
-- ====================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_causa_estado_causa') THEN
        DROP INDEX "idx_causa_estado_causa";
        RAISE NOTICE 'Índice idx_causa_estado_causa eliminado';
    ELSE
        RAISE NOTICE 'Índice idx_causa_estado_causa no existe';
    END IF;
END $$;

-- ====================================
-- 3. ELIMINAR COLUMNA estadoCausaId
-- ====================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Causa' AND column_name = 'estadoCausaId') THEN
        
        ALTER TABLE "Causa" DROP COLUMN "estadoCausaId";
        RAISE NOTICE 'Columna estadoCausaId eliminada de tabla Causa';
    ELSE
        RAISE NOTICE 'Columna estadoCausaId no existe en tabla Causa';
    END IF;
END $$;

-- ====================================
-- 4. ELIMINAR TRIGGER
-- ====================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_estados_causa_updated_at') THEN
        DROP TRIGGER update_estados_causa_updated_at ON "estados_causa";
        RAISE NOTICE 'Trigger update_estados_causa_updated_at eliminado';
    ELSE
        RAISE NOTICE 'Trigger update_estados_causa_updated_at no existe';
    END IF;
END $$;

-- ====================================
-- 5. ELIMINAR TABLA estados_causa
-- ====================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estados_causa') THEN
        DROP TABLE "estados_causa";
        RAISE NOTICE 'Tabla estados_causa eliminada';
    ELSE
        RAISE NOTICE 'Tabla estados_causa no existe';
    END IF;
END $$;

-- ====================================
-- 6. VERIFICACIÓN FINAL
-- ====================================
DO $$ 
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Verificar tabla
    SELECT EXISTS(SELECT 1 FROM information_schema.tables 
                  WHERE table_name = 'estados_causa') INTO table_exists;
    
    -- Verificar columna
    SELECT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Causa' AND column_name = 'estadoCausaId') INTO column_exists;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'VERIFICACIÓN DE ROLLBACK:';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tabla estados_causa: %', CASE WHEN table_exists THEN '✗ Aún existe' ELSE '✓ Eliminada' END;
    RAISE NOTICE 'Columna estadoCausaId: %', CASE WHEN column_exists THEN '✗ Aún existe' ELSE '✓ Eliminada' END;
    RAISE NOTICE '====================================';
END $$;

COMMIT;

-- ====================================
-- ROLLBACK COMPLETADO
-- ====================================
