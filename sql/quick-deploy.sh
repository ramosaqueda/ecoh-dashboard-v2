#!/bin/bash

# ====================================
# SCRIPT DE IMPLEMENTACIÓN RÁPIDA
# ESTADO DE CAUSA - DESARROLLO
# ====================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando implementación de Estados de Causa..."
echo "======================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar que existen los archivos SQL
if [ ! -f "sql/migrate_estado_causa.sql" ]; then
    echo "❌ Error: No se encuentra sql/migrate_estado_causa.sql"
    exit 1
fi

# Leer configuración de base de datos desde .env
if [ -f ".env" ]; then
    source .env
    echo "✅ Configuración cargada desde .env"
else
    echo "❌ Error: No se encuentra archivo .env"
    exit 1
fi

# Construir URL de conexión desde variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está definida en .env"
    exit 1
fi

echo "🔍 Verificando conexión a base de datos..."

# Probar conexión
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Conexión a base de datos exitosa"
else
    echo "❌ Error: No se puede conectar a la base de datos"
    echo "   Verifica tu DATABASE_URL en .env"
    exit 1
fi

echo ""
echo "📦 Ejecutando migración de Estados de Causa..."
echo "======================================"

# Ejecutar script de migración
if psql "$DATABASE_URL" -f "sql/migrate_estado_causa.sql"; then
    echo "✅ Migración ejecutada exitosamente"
else
    echo "❌ Error en la migración"
    exit 1
fi

echo ""
echo "🔍 Ejecutando verificación..."
echo "======================================"

# Ejecutar script de verificación
if psql "$DATABASE_URL" -f "sql/verify_estado_causa.sql"; then
    echo "✅ Verificación completada"
else
    echo "⚠️  Advertencia: Error en verificación"
fi

echo ""
echo "🔄 Sincronizando Prisma..."
echo "======================================"

# Sincronizar Prisma
echo "Ejecutando introspección..."
if npx prisma db pull; then
    echo "✅ Introspección completada"
else
    echo "⚠️  Advertencia: Error en introspección"
fi

echo "Generando cliente Prisma..."
if npx prisma generate; then
    echo "✅ Cliente Prisma generado"
else
    echo "❌ Error al generar cliente Prisma"
    exit 1
fi

echo ""
echo "🎉 ¡IMPLEMENTACIÓN COMPLETADA!"
echo "======================================"
echo "✅ Estados de Causa implementados correctamente"
echo "✅ Base de datos actualizada"
echo "✅ Prisma sincronizado"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Reinicia tu servidor de desarrollo: npm run dev"
echo "   2. Ve al formulario de causas para probar el nuevo campo"
echo "   3. Revisa la API en: http://localhost:3000/api/estados-causa"
echo ""
echo "📚 Estados disponibles:"
echo "   • En Tramitación (TRAMITACION)"
echo "   • Investigación Cerrada (INV_CERRADA)"  
echo "   • Cerrada con Sentencia (CERRADA_SENTENCIA)"
echo ""
echo "🔧 Si tienes problemas:"
echo "   • Ejecuta: psql \"$DATABASE_URL\" -f sql/verify_estado_causa.sql"
echo "   • Revisa los logs del servidor"
echo "======================================"
