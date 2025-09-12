-- ================================================
-- CONSULTAS DE VERIFICACION POST-MIGRACION
-- ================================================

-- 1. Verificar que las tablas de origen existen
SELECT 'origenes_causa' as tabla, COUNT(*) as registros 
FROM origenes_causa
UNION ALL
SELECT 'estados_causa' as tabla, COUNT(*) as registros 
FROM estados_causa;

-- 2. Ver distribucion actual por origen
SELECT 
    oc.id,
    oc.nombre as origen,
    COUNT(c.id) as cantidad_causas
FROM origenes_causa oc
LEFT JOIN "Causa" c ON c."origenCausaId" = oc.id
GROUP BY oc.id, oc.nombre
ORDER BY cantidad_causas DESC;

-- 3. Verificar consistency entre campos obsoletos y nuevos
SELECT 
    'Verificacion de consistency' as tipo,
    COUNT(*) as total_casos,
    SUM(CASE 
        WHEN ("causaEcoh" = true AND "origenCausaId" IN (2,3)) OR
             ("causaSacfi" = true AND "origenCausaId" = 1) OR
             ("causaLegada" = true AND "origenCausaId" = 4)
        THEN 1 ELSE 0 
    END) as casos_consistentes,
    SUM(CASE 
        WHEN ("causaEcoh" = true AND "origenCausaId" NOT IN (2,3)) OR
             ("causaSacfi" = true AND "origenCausaId" != 1) OR
             ("causaLegada" = true AND "origenCausaId" != 4)
        THEN 1 ELSE 0 
    END) as casos_inconsistentes
FROM "Causa"
WHERE "causaEcoh" = true OR "causaSacfi" = true OR "causaLegada" = true;

-- 4. Estadisticas generales
SELECT 
    COUNT(*) as total_causas,
    COUNT(CASE WHEN "origenCausaId" IS NOT NULL THEN 1 END) as con_origen,
    COUNT(CASE WHEN "origenCausaId" IS NULL THEN 1 END) as sin_origen,
    ROUND(
        (COUNT(CASE WHEN "origenCausaId" IS NOT NULL THEN 1 END)::float / COUNT(*)) * 100, 
        2
    ) as porcentaje_con_origen
FROM "Causa";

-- 5. Top 10 fiscales con mas causas (para verificar reportes)
SELECT 
    f.nombre as fiscal,
    COUNT(c.id) as total_causas,
    COUNT(CASE WHEN c."origenCausaId" IN (2,3) THEN 1 END) as ecoh,
    COUNT(CASE WHEN c."origenCausaId" = 1 THEN 1 END) as sacfi,
    COUNT(CASE WHEN c."origenCausaId" = 4 THEN 1 END) as legadas
FROM "Fiscal" f
LEFT JOIN "Causa" c ON f.id = c."fiscalId"
GROUP BY f.id, f.nombre
ORDER BY total_causas DESC
LIMIT 10;
