-- ====================================
-- SCRIPT PARA POBLAR TABLA estados_causa
-- ====================================
-- Ejecutar después de la migración

INSERT INTO "estados_causa" (nombre, descripcion, codigo, activo, orden, color) VALUES
  ('En Tramitación', 'Causa que se encuentra en proceso de investigación activa', 'TRAMITACION', true, 1, '#3b82f6'),
  ('Investigación Cerrada', 'Causa con investigación cerrada pero sin sentencia', 'INV_CERRADA', true, 2, '#f59e0b'),
  ('Cerrada con Sentencia', 'Causa cerrada con sentencia definitiva', 'CERRADA_SENTENCIA', true, 3, '#10b981')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM "estados_causa" ORDER BY orden;

-- Consulta para ver el estado actual de las causas
SELECT 
  c.id,
  c.denominacionCausa,
  c.ruc,
  ec.nombre as estado_causa,
  ec.codigo
FROM "Causa" c
LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
ORDER BY c.id;
