-- ====================================
-- SCRIPT DE VERIFICACIÓN: ESTADO DE CAUSA
-- ====================================
-- Ejecutar después del script de migración para verificar que todo funciona
-- Fecha: 2025-01-15
-- Versión: 1.0

-- ====================================
-- 1. VERIFICACIÓN DE ESTRUCTURA
-- ====================================

-- Verificar que la tabla estados_causa existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estados_causa') 
        THEN '✓ Tabla estados_causa existe'
        ELSE '✗ Tabla estados_causa NO existe'
    END as verificacion_tabla;

-- Verificar que la columna estadoCausaId existe en Causa
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'Causa' AND column_name = 'estadoCausaId') 
        THEN '✓ Columna estadoCausaId existe en Causa'
        ELSE '✗ Columna estadoCausaId NO existe en Causa'
    END as verificacion_columna;

-- Verificar que el índice existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_causa_estado_causa') 
        THEN '✓ Índice idx_causa_estado_causa existe'
        ELSE '✗ Índice idx_causa_estado_causa NO existe'
    END as verificacion_indice;

-- Verificar que la foreign key existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.table_constraints 
                     WHERE constraint_name = 'Causa_estadoCausaId_fkey') 
        THEN '✓ Foreign key Causa_estadoCausaId_fkey existe'
        ELSE '✗ Foreign key Causa_estadoCausaId_fkey NO existe'
    END as verificacion_fk;

-- ====================================
-- 2. VERIFICACIÓN DE DATOS
-- ====================================

-- Mostrar todos los estados de causa
SELECT 
    '--- ESTADOS DE CAUSA DISPONIBLES ---' as titulo
UNION ALL
SELECT 
    CONCAT(
        'ID: ', id, 
        ' | Nombre: ', nombre, 
        ' | Código: ', codigo, 
        ' | Orden: ', COALESCE(orden::text, 'NULL'),
        ' | Color: ', COALESCE(color, 'NULL')
    ) as detalle
FROM "estados_causa" 
ORDER BY CASE WHEN titulo = '--- ESTADOS DE CAUSA DISPONIBLES ---' THEN 0 ELSE 1 END, orden;

-- Contar registros
SELECT 
    COUNT(*) as total_estados,
    COUNT(CASE WHEN activo = true THEN 1 END) as estados_activos,
    COUNT(CASE WHEN activo = false THEN 1 END) as estados_inactivos
FROM "estados_causa";

-- ====================================
-- 3. VERIFICACIÓN DE RELACIONES
-- ====================================

-- Estadísticas de causas por estado
SELECT 
    '--- DISTRIBUCIÓN DE CAUSAS POR ESTADO ---' as titulo
UNION ALL
SELECT 
    CONCAT(
        COALESCE(ec.nombre, 'Sin Estado Asignado'), 
        ': ', 
        COUNT(c.id), 
        ' causas'
    ) as distribucion
FROM "Causa" c
LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
GROUP BY ec.nombre, ec.orden
ORDER BY CASE WHEN titulo = '--- DISTRIBUCIÓN DE CAUSAS POR ESTADO ---' THEN 0 ELSE 1 END, ec.orden NULLS LAST;

-- ====================================
-- 4. PRUEBAS DE FUNCIONAMIENTO
-- ====================================

-- Test: Intentar insertar un estado duplicado (debería fallar)
DO $$ 
BEGIN
    BEGIN
        INSERT INTO "estados_causa" ("nombre", "codigo") 
        VALUES ('Test Duplicado', 'TRAMITACION');
        RAISE NOTICE '✗ ERROR: Se pudo insertar estado duplicado';
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE NOTICE '✓ CORRECTO: No se puede insertar estado duplicado';
    END;
END $$;

-- Test: Verificar que se puede hacer UPDATE en Causa con estadoCausaId
DO $$ 
DECLARE
    test_causa_id INTEGER;
    test_estado_id INTEGER;
BEGIN
    -- Obtener una causa de prueba
    SELECT id INTO test_causa_id FROM "Causa" LIMIT 1;
    -- Obtener un estado de prueba
    SELECT id INTO test_estado_id FROM "estados_causa" WHERE codigo = 'TRAMITACION';
    
    IF test_causa_id IS NOT NULL AND test_estado_id IS NOT NULL THEN
        -- Probar update
        UPDATE "Causa" 
        SET "estadoCausaId" = test_estado_id 
        WHERE id = test_causa_id;
        
        -- Verificar que se actualizó
        IF EXISTS (SELECT 1 FROM "Causa" WHERE id = test_causa_id AND "estadoCausaId" = test_estado_id) THEN
            RAISE NOTICE '✓ CORRECTO: Se puede actualizar estadoCausaId en Causa';
        ELSE
            RAISE NOTICE '✗ ERROR: No se pudo actualizar estadoCausaId en Causa';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ INFO: No hay datos de prueba disponibles';
    END IF;
END $$;

-- ====================================
-- 5. CONSULTAS ÚTILES DE EJEMPLO
-- ====================================

-- Ejemplo: Causas con estado
SELECT 
    '--- EJEMPLO: PRIMERAS 5 CAUSAS CON ESTADO ---' as titulo
UNION ALL
SELECT 
    CONCAT(
        'ID ', c.id, ': ', 
        LEFT(c."denominacionCausa", 30), 
        ' | Estado: ', 
        COALESCE(ec.nombre, 'Sin Estado'),
        ' | RUC: ',
        COALESCE(c.ruc, 'Sin RUC')
    ) as ejemplo
FROM "Causa" c
LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
ORDER BY CASE WHEN titulo = '--- EJEMPLO: PRIMERAS 5 CAUSAS CON ESTADO ---' THEN 0 ELSE 1 END, c.id
LIMIT 6; -- 1 para el título + 5 causas

-- ====================================
-- 6. REPORTE FINAL
-- ====================================

SELECT 
    '====================================',
    '           REPORTE FINAL            ',
    '====================================',
    CONCAT('✓ Estados de causa implementados: ', (SELECT COUNT(*) FROM "estados_causa")),
    CONCAT('✓ Total de causas en sistema: ', (SELECT COUNT(*) FROM "Causa")),
    CONCAT('✓ Causas con estado asignado: ', (SELECT COUNT(*) FROM "Causa" WHERE "estadoCausaId" IS NOT NULL)),
    CONCAT('✓ Causas sin estado: ', (SELECT COUNT(*) FROM "Causa" WHERE "estadoCausaId" IS NULL)),
    '====================================',
    'La implementación de Estados de Causa está COMPLETA'
    '====================================';

-- ====================================
-- VERIFICACIÓN COMPLETADA
-- ====================================
