#!/bin/bash

# Script de Implementación Segura - Funcionalidad Highlight
# Uso: ./implement_highlight.sh

echo "🚀 IMPLEMENTACIÓN SEGURA - FUNCIONALIDAD HIGHLIGHT"
echo "=================================================="

# Definir rutas (ajustar según tu estructura)
PROJECT_ROOT="E:/desa/ecoh/ecoh-dashboard"
PAGE_FILE="$PROJECT_ROOT/app/dashboard/actividades/page.tsx"
NEW_VERSION="$PROJECT_ROOT/Complete updated page.tsx"
BACKUP_FILE="$PROJECT_ROOT/page.tsx.backup"

echo "📁 Configuración de archivos:"
echo "   Proyecto: $PROJECT_ROOT"
echo "   Archivo destino: $PAGE_FILE"
echo "   Nueva versión: $NEW_VERSION"
echo "   Backup: $BACKUP_FILE"
echo ""

# Verificar que los archivos existen
if [ ! -f "$NEW_VERSION" ]; then
    echo "❌ Error: No se encontró la nueva versión en $NEW_VERSION"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: No se encontró el backup en $BACKUP_FILE"
    exit 1
fi

# Crear directorio destino si no existe
PAGE_DIR=$(dirname "$PAGE_FILE")
if [ ! -d "$PAGE_DIR" ]; then
    echo "📁 Creando directorio: $PAGE_DIR"
    mkdir -p "$PAGE_DIR"
fi

echo "✅ Pre-verificaciones completadas"
echo ""

# Mostrar resumen de cambios
echo "📊 RESUMEN DE CAMBIOS A IMPLEMENTAR:"
echo "===================================="
echo "✨ Funcionalidades nuevas:"
echo "   • Lectura de parámetro ?highlight=ID desde URL"
echo "   • Búsqueda automática de actividad específica"
echo "   • Scroll suave a actividad encontrada"
echo "   • Banner informativo con estado de búsqueda"
echo "   • Auto-carga de páginas adicionales si es necesario"
echo "   • Notificaciones de progreso y resultado"
echo ""
echo "⚠️  DEPENDENCIAS REQUERIDAS:"
echo "   • ActividadesTable debe recibir prop 'highlightId'"
echo "   • ActividadesTable debe implementar highlighting visual"
echo "   • Filas deben tener ID único: actividad-row-{id}"
echo ""

# Confirmación del usuario
read -p "¿Desea continuar con la implementación? (y/N): " -n 1 -r
echo ""
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Implementación cancelada por el usuario."
    exit 0
fi

# Backup de la versión actual si existe
if [ -f "$PAGE_FILE" ]; then
    CURRENT_BACKUP="${PAGE_FILE}.pre-highlight.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Creando backup de la versión actual: $CURRENT_BACKUP"
    cp "$PAGE_FILE" "$CURRENT_BACKUP"
fi

# Implementar los cambios
echo "🔄 Implementando nueva versión..."
if cp "$NEW_VERSION" "$PAGE_FILE"; then
    echo "✅ Archivo actualizado exitosamente!"
else
    echo "❌ Error al copiar la nueva versión."
    exit 1
fi

echo ""
echo "🎉 IMPLEMENTACIÓN COMPLETADA!"
echo "============================="
echo ""
echo "📁 Archivos generados:"
if [ -f "$CURRENT_BACKUP" ]; then
    echo "   Backup versión anterior: $CURRENT_BACKUP"
fi
echo "   Archivo actualizado: $PAGE_FILE"
echo "   Backup original disponible: $BACKUP_FILE"
echo ""

echo "🔧 PRÓXIMOS PASOS OBLIGATORIOS:"
echo "==============================="
echo ""
echo "1️⃣  ACTUALIZAR ActividadesTable:"
echo "   • Agregar prop: highlightId?: number | null"
echo "   • Implementar highlighting en filas"
echo "   • Agregar IDs únicos: id={\`actividad-row-\${actividad.id}\`}"
echo ""
echo "2️⃣  CÓDIGO SUGERIDO para ActividadesTable:"
echo "   interface ActividadesTableProps {"
echo "     // ... props existentes"
echo "     highlightId?: number | null;"
echo "   }"
echo ""
echo "   // En el JSX de las filas:"
echo "   <tr"
echo "     id={\`actividad-row-\${actividad.id}\`}"
echo "     className={actividad.id === highlightId ?"
echo "       'bg-yellow-100 border-l-4 border-yellow-500' : ''}"
echo "   >"
echo ""
echo "3️⃣  TESTING:"
echo "   • Reiniciar servidor de desarrollo"
echo "   • Probar: /dashboard/actividades?highlight=123"
echo "   • Verificar scroll automático y highlighting"
echo ""
echo "4️⃣  EN CASO DE PROBLEMAS:"
echo "   • Ejecutar rollback: ./rollback.sh $PAGE_FILE"
echo "   • O restaurar desde: $BACKUP_FILE"
echo ""

echo "⚠️  RECORDATORIO IMPORTANTE:"
echo "La funcionalidad NO trabajará completamente hasta que"
echo "ActividadesTable sea actualizado con la prop highlightId."
echo ""

echo "🔍 Para verificar que todo funciona:"
echo "   1. Actualizar ActividadesTable (REQUERIDO)"
echo "   2. npm run dev (reiniciar servidor)"
echo "   3. Ir a: http://localhost:3000/dashboard/actividades?highlight=405"
echo "   4. Verificar que la actividad se resalta y hace scroll"
echo ""

echo "✨ ¡Implementación lista! Continúe con ActividadesTable."
