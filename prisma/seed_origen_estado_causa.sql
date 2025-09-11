-- ===============================
-- POBLAR TABLAS OrigenCausa y EstadoCausa
-- ===============================

-- Poblar OrigenCausa (solo si no existen)
INSERT INTO "OrigenCausa" ("nombre", "codigo", "descripcion", "orden", "color", "activo") 
VALUES
    ('ECOH', 'ECOH', 'Causas originadas en la Unidad ECOH', 1, '#ef4444', true),
    ('SACFI', 'SACFI', 'Causas originadas en SACFI', 2, '#3b82f6', true),
    ('Legada', 'LEG', 'Causas legadas de otras unidades fiscales', 3, '#f59e0b', true),
    ('Externa', 'EXT', 'Causas provenientes de fuentes externas', 4, '#10b981', true),
    ('Derivada', 'DER', 'Causas derivadas de otras investigaciones', 5, '#8b5cf6', true)
ON CONFLICT (codigo) DO NOTHING;

-- Poblar EstadoCausa (solo si no existen)
INSERT INTO "EstadoCausa" ("nombre", "codigo", "descripcion", "orden", "color", "activo")
VALUES
    ('En Tramitación', 'TRAMITACION', 'Causa en proceso de investigación activa', 1, '#3b82f6', true),
    ('Investigación Cerrada', 'INV_CERRADA', 'Investigación cerrada sin acusación', 2, '#f59e0b', true),
    ('Formalización Pendiente', 'FORM_PEND', 'Pendiente de formalización de cargos', 3, '#06b6d4', true),
    ('Formalizado', 'FORMALIZADO', 'Imputado formalizado con cargos', 4, '#a855f7', true),
    ('Juicio Oral', 'JUICIO_ORAL', 'En etapa de juicio oral', 5, '#f97316', true),
    ('Cerrada con Sentencia', 'CERRADA_SENT', 'Cerrada con sentencia definitiva', 6, '#10b981', true),
    ('Suspendida', 'SUSPENDIDA', 'Causa suspendida temporalmente', 7, '#6b7280', true),
    ('Archivo Provisional', 'ARCH_PROV', 'Archivada provisionalmente', 8, '#64748b', true),
    ('Sobreseimiento', 'SOBRESEIMIENTO', 'Sobreseimiento definitivo o temporal', 9, '#475569', true)
ON CONFLICT (codigo) DO NOTHING;

-- Migrar datos existentes de campos boolean a relaciones
-- (Solo actualizar si origenCausaId es NULL)
UPDATE "Causa" 
SET "origenCausaId" = (SELECT id FROM "OrigenCausa" WHERE codigo = 'ECOH')
WHERE "causaEcoh" = true AND "origenCausaId" IS NULL;

UPDATE "Causa" 
SET "origenCausaId" = (SELECT id FROM "OrigenCausa" WHERE codigo = 'SACFI')
WHERE "causaSacfi" = true AND "origenCausaId" IS NULL;

UPDATE "Causa" 
SET "origenCausaId" = (SELECT id FROM "OrigenCausa" WHERE codigo = 'LEG')
WHERE "causaLegada" = true AND "origenCausaId" IS NULL;

-- Asignar estado por defecto "En Tramitación" a causas sin estado
UPDATE "Causa" 
SET "estadoCausaId" = (SELECT id FROM "EstadoCausa" WHERE codigo = 'TRAMITACION')
WHERE "estadoCausaId" IS NULL;

-- Verificar la migración
SELECT 
    'OrigenCausa' as tabla,
    COUNT(*) as registros
FROM "OrigenCausa"
UNION ALL
SELECT 
    'EstadoCausa' as tabla,
    COUNT(*) as registros  
FROM "EstadoCausa"
UNION ALL
SELECT 
    'Causas con origen' as tabla,
    COUNT(*) as registros
FROM "Causa" 
WHERE "origenCausaId" IS NOT NULL
UNION ALL
SELECT 
    'Causas con estado' as tabla,
    COUNT(*) as registros
FROM "Causa" 
WHERE "estadoCausaId" IS NOT NULL;