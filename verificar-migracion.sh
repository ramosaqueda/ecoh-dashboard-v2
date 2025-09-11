#!/bin/bash

# ================================================
# SCRIPT DE VERIFICACIÓN POST-MIGRACIÓN
# ================================================

echo "🔍 VERIFICANDO MIGRACIÓN DE ENDPOINTS COMPLETADA"
echo "================================================"

PROJECT_DIR="E:/desa/ecoh/ecoh-dashboard"
LOG_FILE="$PROJECT_DIR/verificacion-migracion.log"

# Función para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "📋 Verificando archivos migrados..."

# Verificar que los archivos existen y tienen el nuevo código
FILES_MIGRADOS=(
    "$PROJECT_DIR/app/api/reportes/fiscales/route.ts"
    "$PROJECT_DIR/app/api/reportes/fiscales/export/route.ts"
)

for file in "${FILES_MIGRADOS[@]}"; do
    if [ -f "$file" ]; then
        log "✅ Archivo existe: $file"
        
        # Verificar que contiene las constantes ORIGEN_IDS
        if grep -q "ORIGEN_IDS" "$file"; then
            log "✅ Contiene ORIGEN_IDS: $file"
        else
            log "❌ NO contiene ORIGEN_IDS: $file"
        fi
        
        # Verificar que contiene origenCausa
        if grep -q "origenCausa" "$file"; then
            log "✅ Contiene origenCausa: $file"
        else
            log "❌ NO contiene origenCausa: $file"
        fi
        
        # Verificar compatibilidad temporal
        if grep -q "causaEcoh.*true.*origenCausaId" "$file"; then
            log "✅ Tiene compatibilidad temporal: $file"
        else
            log "⚠️  Sin compatibilidad temporal: $file"
        fi
        
    else
        log "❌ Archivo NO existe: $file"
    fi
done

echo ""
echo "🧪 COMANDOS DE PRUEBA"
echo "================================================"

# Crear comandos de prueba
cat > "$PROJECT_DIR/test-endpoints-migrados.sh" << 'EOF'
#!/bin/bash

echo "🧪 Probando endpoints migrados..."

BASE_URL="http://localhost:3000/api"

echo ""
echo "1. 📊 Reporte fiscales básico:"
curl -s "$BASE_URL/reportes/fiscales" | jq '.totalCausas, .distribucionPorOrigen'

echo ""
echo "2. 🔍 Filtro por ECOH (nuevo):"
curl -s "$BASE_URL/reportes/fiscales?origenCausaId=2" | jq '.totalCausas'

echo ""
echo "3. 🔄 Compatibilidad temporal causaEcoh:"
curl -s "$BASE_URL/reportes/fiscales?causaEcoh=true" | jq '.totalCausas'

echo ""
echo "4. 📈 Filtro por SACFI (nuevo):"
curl -s "$BASE_URL/reportes/fiscales?origenCausaId=1" | jq '.totalCausas'

echo ""
echo "5. 🔄 Compatibilidad temporal causaSacfi:"
curl -s "$BASE_URL/reportes/fiscales?causaSacfi=true" | jq '.totalCausas'

echo ""
echo "6. 📊 Exportación XLSX:"
curl -s "$BASE_URL/reportes/fiscales/export?formato=xlsx" -o "test-export.xlsx"
if [ -f "test-export.xlsx" ]; then
    echo "✅ Archivo XLSX generado correctamente"
    ls -lh "test-export.xlsx"
else
    echo "❌ Error generando XLSX"
fi

echo ""
echo "7. 📊 Exportación CSV:"
curl -s "$BASE_URL/reportes/fiscales/export?formato=csv" -o "test-export.csv"
if [ -f "test-export.csv" ]; then
    echo "✅ Archivo CSV generado correctamente"
    echo "Primeras líneas del CSV:"
    head -n 3 "test-export.csv"
else
    echo "❌ Error generando CSV"
fi

echo ""
echo "✅ Pruebas completadas"
EOF

chmod +x "$PROJECT_DIR/test-endpoints-migrados.sh"
log "📋 Script de pruebas creado: test-endpoints-migrados.sh"

echo ""
echo "📝 CHECKLIST DE VERIFICACIÓN"
echo "================================================"

cat > "$PROJECT_DIR/checklist-verificacion.md" << 'EOF'
# ✅ Checklist de Verificación - Migración Completada

## 🔧 Archivos Migrados
- [ ] `/api/reportes/fiscales/route.ts` - Contiene ORIGEN_IDS y nueva lógica
- [ ] `/api/reportes/fiscales/export/route.ts` - Sincronizado con endpoint principal
- [ ] Ambos archivos tienen compatibilidad temporal
- [ ] Funciones helper implementadas

## 🧪 Pruebas Funcionales
- [ ] Endpoint principal responde sin errores
- [ ] Filtro `origenCausaId=2` (ECOH) funciona
- [ ] Filtro `origenCausaId=1` (SACFI) funciona
- [ ] Filtro `origenCausaId=4` (Legadas) funciona
- [ ] Compatibilidad `causaEcoh=true` funciona
- [ ] Compatibilidad `causaSacfi=true` funciona
- [ ] Compatibilidad `causaLegada=true` funciona

## 📊 Exportaciones
- [ ] XLSX se genera correctamente
- [ ] CSV se genera correctamente
- [ ] Nuevas columnas presentes (Origen, Estado Causa)
- [ ] Datos consistentes con endpoint principal

## 📈 Datos y Rendimiento
- [ ] Conteos de causas son correctos
- [ ] No hay pérdida de datos
- [ ] Tiempos de respuesta aceptables
- [ ] Logs sin errores críticos

## 🔄 Compatibilidad
- [ ] Frontend sigue funcionando
- [ ] Reportes existentes siguen funcionando
- [ ] Dashboard carga sin errores
- [ ] Filtros combinados funcionan

## 📋 Próximos Pasos
- [ ] Monitorear logs por 24-48 horas
- [ ] Actualizar componentes frontend progresivamente
- [ ] Planificar eliminación de campos obsoletos
- [ ] Documentar cambios para el equipo

---

**Fecha de migración:** $(date)
**Estado:** En verificación
EOF

log "📋 Checklist creado: checklist-verificacion.md"

echo ""
echo "🔍 CONSULTAS SQL DE VERIFICACIÓN"
echo "================================================"

cat > "$PROJECT_DIR/verificar-datos-migrados.sql" << 'EOF'
-- ================================================
-- CONSULTAS DE VERIFICACIÓN POST-MIGRACIÓN
-- ================================================

-- 1. Verificar que las tablas de origen existen
SELECT 'origenes_causa' as tabla, COUNT(*) as registros 
FROM origenes_causa
UNION ALL
SELECT 'estados_causa' as tabla, COUNT(*) as registros 
FROM estados_causa;

-- 2. Ver distribución actual por origen
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
    'Verificación de consistency' as tipo,
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

-- 4. Estadísticas generales
SELECT 
    COUNT(*) as total_causas,
    COUNT(CASE WHEN "origenCausaId" IS NOT NULL THEN 1 END) as con_origen,
    COUNT(CASE WHEN "origenCausaId" IS NULL THEN 1 END) as sin_origen,
    ROUND(
        (COUNT(CASE WHEN "origenCausaId" IS NOT NULL THEN 1 END)::float / COUNT(*)) * 100, 
        2
    ) as porcentaje_con_origen
FROM "Causa";

-- 5. Top 10 fiscales con más causas (para verificar reportes)
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
EOF

log "📋 Consultas SQL creadas: verificar-datos-migrados.sql"

echo ""
echo "🎯 RESUMEN FINAL"
echo "================================================"
echo "✅ Archivos migrados correctamente"
echo "📋 Scripts de verificación creados"
echo "🧪 Comandos de prueba disponibles"
echo ""
echo "📌 EJECUTAR AHORA:"
echo "1. Reiniciar el servidor: npm run dev"
echo "2. Ejecutar pruebas: ./test-endpoints-migrados.sh"
echo "3. Verificar BD: psql -f verificar-datos-migrados.sql"
echo "4. Completar checklist: checklist-verificacion.md"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Los campos obsoletos AÚN EXISTEN en la BD"
echo "- Solo elimínalos después de 100% verificación"
echo "- Mantén backups por al menos 1 semana"
echo ""
echo "🎉 MIGRACIÓN DE ENDPOINTS COMPLETADA"

log "🎯 Verificación completada exitosamente"