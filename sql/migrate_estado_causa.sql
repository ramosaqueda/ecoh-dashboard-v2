-- ====================================
-- SCRIPT DE IMPLEMENTACIÓN: ESTADO DE CAUSA
-- ====================================
-- Este script es idempotente y se puede ejecutar múltiples veces
-- Descripción: Agrega la funcionalidad de Estados de Causa al sistema
-- Fecha: 2025-01-15
-- Versión: 1.0

BEGIN;

-- ====================================
-- 1. CREAR TABLA ESTADOS_CAUSA
-- ====================================
DO $$ 
BEGIN
    -- Verificar si la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estados_causa') THEN
        
        CREATE TABLE "estados_causa" (
            "id" SERIAL NOT NULL,
            "nombre" VARCHAR(100) NOT NULL,
            "descripcion" VARCHAR(500),
            "codigo" VARCHAR(20) NOT NULL,
            "activo" BOOLEAN NOT NULL DEFAULT true,
            "orden" INTEGER,
            "color" VARCHAR(7),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "estados_causa_pkey" PRIMARY KEY ("id")
        );

        -- Crear índices únicos
        CREATE UNIQUE INDEX "estados_causa_nombre_key" ON "estados_causa"("nombre");
        CREATE UNIQUE INDEX "estados_causa_codigo_key" ON "estados_causa"("codigo");
        
        RAISE NOTICE 'Tabla estados_causa creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla estados_causa ya existe, saltando creación';
    END IF;
END $$;

-- ====================================
-- 2. AGREGAR COLUMNA estadoCausaId A TABLA Causa
-- ====================================
DO $$ 
BEGIN
    -- Verificar si la columna existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Causa' AND column_name = 'estadoCausaId') THEN
        
        ALTER TABLE "Causa" ADD COLUMN "estadoCausaId" INTEGER;
        RAISE NOTICE 'Columna estadoCausaId agregada a tabla Causa';
    ELSE
        RAISE NOTICE 'Columna estadoCausaId ya existe en tabla Causa';
    END IF;
END $$;

-- ====================================
-- 3. CREAR ÍNDICE PARA PERFORMANCE
-- ====================================
DO $$ 
BEGIN
    -- Verificar si el índice existe
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_causa_estado_causa') THEN
        CREATE INDEX "idx_causa_estado_causa" ON "Causa"("estadoCausaId");
        RAISE NOTICE 'Índice idx_causa_estado_causa creado';
    ELSE
        RAISE NOTICE 'Índice idx_causa_estado_causa ya existe';
    END IF;
END $$;

-- ====================================
-- 4. CREAR FOREIGN KEY CONSTRAINT
-- ====================================
DO $$ 
BEGIN
    -- Verificar si la constraint existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Causa_estadoCausaId_fkey') THEN
        
        ALTER TABLE "Causa" 
        ADD CONSTRAINT "Causa_estadoCausaId_fkey" 
        FOREIGN KEY ("estadoCausaId") 
        REFERENCES "estados_causa"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
        
        RAISE NOTICE 'Foreign key Causa_estadoCausaId_fkey creada';
    ELSE
        RAISE NOTICE 'Foreign key Causa_estadoCausaId_fkey ya existe';
    END IF;
END $$;

-- ====================================
-- 5. INSERTAR DATOS INICIALES
-- ====================================
DO $$ 
BEGIN
    -- Insertar estados solo si no existen
    INSERT INTO "estados_causa" ("nombre", "descripcion", "codigo", "activo", "orden", "color") 
    SELECT * FROM (VALUES 
        ('En Tramitación', 'Causa que se encuentra en proceso de investigación activa', 'TRAMITACION', true, 1, '#3b82f6'),
        ('Investigación Cerrada', 'Causa con investigación cerrada pero sin sentencia', 'INV_CERRADA', true, 2, '#f59e0b'),
        ('Cerrada con Sentencia', 'Causa cerrada con sentencia definitiva', 'CERRADA_SENTENCIA', true, 3, '#10b981')
    ) AS v("nombre", "descripcion", "codigo", "activo", "orden", "color")
    WHERE NOT EXISTS (
        SELECT 1 FROM "estados_causa" WHERE "codigo" = v."codigo"
    );
    
    -- Verificar cuántos registros se insertaron
    IF FOUND THEN
        RAISE NOTICE 'Estados de causa insertados correctamente';
    ELSE
        RAISE NOTICE 'Estados de causa ya existían, no se insertaron duplicados';
    END IF;
END $$;

-- ====================================
-- 6. ACTUALIZAR TIMESTAMP TRIGGER (Opcional)
-- ====================================
DO $$ 
BEGIN
    -- Crear función para actualizar timestamp si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS '
        BEGIN
            NEW."updatedAt" = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        ' LANGUAGE 'plpgsql';
        
        RAISE NOTICE 'Función update_updated_at_column creada';
    END IF;

    -- Crear trigger para actualizar updatedAt automáticamente
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_estados_causa_updated_at') THEN
        CREATE TRIGGER update_estados_causa_updated_at
            BEFORE UPDATE ON "estados_causa"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Trigger update_estados_causa_updated_at creado';
    ELSE
        RAISE NOTICE 'Trigger update_estados_causa_updated_at ya existe';
    END IF;
END $$;

-- ====================================
-- 7. VERIFICACIÓN FINAL
-- ====================================
DO $$ 
DECLARE
    causa_count INTEGER;
    estado_count INTEGER;
    column_exists BOOLEAN;
    fk_exists BOOLEAN;
BEGIN
    -- Contar causas
    SELECT COUNT(*) INTO causa_count FROM "Causa";
    
    -- Contar estados
    SELECT COUNT(*) INTO estado_count FROM "estados_causa";
    
    -- Verificar columna
    SELECT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Causa' AND column_name = 'estadoCausaId') INTO column_exists;
    
    -- Verificar foreign key
    SELECT EXISTS(SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'Causa_estadoCausaId_fkey') INTO fk_exists;
    
    -- Reportar estado
    RAISE NOTICE '====================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL:';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Tabla estados_causa: ✓ Existe con % registros', estado_count;
    RAISE NOTICE 'Columna estadoCausaId en Causa: %', CASE WHEN column_exists THEN '✓ Existe' ELSE '✗ No existe' END;
    RAISE NOTICE 'Foreign Key constraint: %', CASE WHEN fk_exists THEN '✓ Existe' ELSE '✗ No existe' END;
    RAISE NOTICE 'Total de causas en sistema: %', causa_count;
    RAISE NOTICE '====================================';
    
    -- Mostrar estados insertados
    RAISE NOTICE 'Estados de causa disponibles:';
    FOR estado_count IN 
        SELECT s.id FROM "estados_causa" s ORDER BY s.orden
    LOOP
        RAISE NOTICE '- ID %: % (%) - %', 
            (SELECT id FROM "estados_causa" WHERE id = estado_count),
            (SELECT nombre FROM "estados_causa" WHERE id = estado_count),
            (SELECT codigo FROM "estados_causa" WHERE id = estado_count),
            (SELECT descripcion FROM "estados_causa" WHERE id = estado_count);
    END LOOP;
    
END $$;

-- ====================================
-- 8. DATOS DE CONSULTA ÚTILES
-- ====================================

-- Consulta para verificar estados después de la ejecución
-- SELECT * FROM "estados_causa" ORDER BY "orden";

-- Consulta para ver causas con su estado
-- SELECT 
--     c.id,
--     c."denominacionCausa",
--     c.ruc,
--     ec.nombre as estado_causa,
--     ec.codigo as estado_codigo
-- FROM "Causa" c
-- LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
-- ORDER BY c.id
-- LIMIT 10;

-- Consulta para estadísticas por estado
-- SELECT 
--     COALESCE(ec.nombre, 'Sin Estado') as estado,
--     COUNT(*) as cantidad_causas
-- FROM "Causa" c
-- LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
-- GROUP BY ec.nombre, ec.orden
-- ORDER BY ec.orden NULLS LAST;

COMMIT;

-- ====================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- ====================================
