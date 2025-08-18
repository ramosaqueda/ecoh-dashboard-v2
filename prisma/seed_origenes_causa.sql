-- ====================================
-- SCRIPT PARA POBLAR TABLA origenes_causa
-- ====================================
-- Ejecutar después de la migración

INSERT INTO "origenes_causa" (nombre, descripcion, codigo, orden, color) VALUES
  ('ECOH', 'Equipo de Crimen Organizado y Homicidios', 'ECOH', 1, '#ef4444'),
  ('SACFI', 'Sistema de Análisis Criminal y Focalización de la Investigación', 'SACFI', 2, '#3b82f6'),
  ('LEGADA', 'Causa Legada de otra unidad', 'LEGADA', 3, '#f59e0b')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM "origenes_causa" ORDER BY orden;
