#!/bin/bash

# Script de Rollback para ActividadesPage
# Uso: ./rollback.sh [ruta-al-archivo-page.tsx]

echo "🔄 SCRIPT DE ROLLBACK - ACTIVIDADES PAGE"
echo "========================================"

# Verificar si se proporciona la ruta del archivo
if [ -z "$1" ]; then
    echo "❌ Error: Debe proporcionar la ruta al archivo page.tsx"
    echo "Uso: ./rollback.sh /ruta/al/page.tsx"
    echo ""
    echo "Ejemplo:"
    echo "  ./rollback.sh E:/desa/ecoh/ecoh-dashboard/app/dashboard/actividades/page.tsx"
    exit 1
fi

PAGE_FILE="$1"
BACKUP_FILE="E:/desa/ecoh/ecoh-dashboard/page.tsx.backup"

# Verificar que el archivo backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: No se encontró el archivo de backup en $BACKUP_FILE"
    echo "No se puede realizar el rollback."
    echo ""
    echo "Archivos de backup disponibles:"
    find "$(dirname "$PAGE_FILE")" -name "*.backup" -o -name "*pre-highlight*" 2>/dev/null || echo "   (ninguno encontrado)"
    exit 1
fi

# Verificar que el archivo original existe
if [ ! -f "$PAGE_FILE" ]; then
    echo "❌ Error: No se encontró el archivo original en $PAGE_FILE"
    exit 1
fi

echo "📋 Archivos encontrados:"
echo "   Original: $PAGE_FILE"
echo "   Backup:   $BACKUP_FILE"
echo ""

# Mostrar información de los archivos
echo "📊 Información de archivos:"
echo "   Tamaño original: $(wc -l < "$PAGE_FILE") líneas"
echo "   Tamaño backup:   $(wc -l < "$BACKUP_FILE") líneas"
echo "   Fecha backup:    $(stat -f "%Sm" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null || echo "desconocida")"
echo ""

# Verificar diferencias
echo "📊 Verificando diferencias..."
if cmp -s "$BACKUP_FILE" "$PAGE_FILE"; then
    echo "✅ Los archivos son idénticos. No se necesita rollback."
    exit 0
else
    echo "⚠️  Los archivos son diferentes. Se requiere rollback."
fi
echo ""

# Mostrar algunas diferencias para contexto
if command -v diff >/dev/null 2>&1; then
    echo "🔍 Primeras diferencias encontradas:"
    echo "====================================="
    diff -u "$BACKUP_FILE" "$PAGE_FILE" | head -20
    echo "..."
    echo "(Mostrando solo las primeras líneas de diferencias)"
    echo ""
fi

# Confirmación del usuario
echo "⚠️  ADVERTENCIA: Este rollback:"
echo "   • Restaurará el archivo original SIN funcionalidad highlight"
echo "   • Creará un backup de la versión actual"
echo "   • Requerirá reiniciar el servidor de desarrollo"
echo ""

read -p "¿Está seguro de que desea hacer rollback? (y/N): " -n 1 -r
echo ""
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelado por el usuario."
    exit 0
fi

# Crear backup de la versión actual antes del rollback
CURRENT_BACKUP="${PAGE_FILE}.pre-rollback.$(date +%Y%m%d_%H%M%S)"
echo "💾 Creando backup de la versión actual en: $CURRENT_BACKUP"
if cp "$PAGE_FILE" "$CURRENT_BACKUP"; then
    echo "✅ Backup creado exitosamente"
else
    echo "❌ Error al crear backup. Abortando rollback."
    exit 1
fi

# Realizar el rollback
echo "🔄 Realizando rollback..."
if cp "$BACKUP_FILE" "$PAGE_FILE"; then
    echo "✅ Rollback completado exitosamente!"
else
    echo "❌ Error durante el rollback. Restaurando versión actual..."
    cp "$CURRENT_BACKUP" "$PAGE_FILE"
    echo "❌ Rollback falló. Archivo restaurado al estado anterior."
    exit 1
fi

echo ""
echo "🎉 ROLLBACK COMPLETADO"
echo "====================="
echo ""
echo "📁 Archivos generados:"
echo "   Backup de versión con highlight: $CURRENT_BACKUP"
echo "   Archivo restaurado (SIN highlight): $PAGE_FILE"
echo "   Backup original disponible: $BACKUP_FILE"
echo ""
echo "🔧 Próximos pasos OBLIGATORIOS:"
echo "   1. Reiniciar servidor de desarrollo (npm run dev)"
echo "   2. Verificar que la aplicación funciona correctamente"
echo "   3. Si ActividadesTable fue modificado, también hacer rollback"
echo ""
echo "🔄 Para restaurar funcionalidad highlight:"
echo "   cp \"$CURRENT_BACKUP\" \"$PAGE_FILE\""
echo "   (y luego reiniciar servidor)"
echo ""
echo "⚠️  NOTA IMPORTANTE:"
echo "   • La funcionalidad highlight ha sido removida"
echo "   • URLs con ?highlight=X seguirán funcionando pero sin efecto visual"
echo "   • Si ActividadesTable tenía prop 'highlightId', puede generar warnings"
echo ""

echo "✨ Rollback completado! Reinicie su servidor."
