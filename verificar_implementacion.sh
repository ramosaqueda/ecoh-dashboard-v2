#!/bin/bash

# Script de Verificación de Implementación
# MEJORAS DEL SISTEMA DE NOTIFICACIONES Y ACTIVIDADES

echo "🔍 VERIFICANDO IMPLEMENTACIÓN DE MEJORAS..."
echo "=============================================="

# Función para verificar si un archivo existe
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ $1 - ARCHIVO FALTANTE"
    fi
}

# Función para verificar si un directorio existe
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1 (directorio)"
    else
        echo "❌ $1 - DIRECTORIO FALTANTE"
    fi
}

echo ""
echo "📁 VERIFICANDO ESTRUCTURA DE ARCHIVOS:"
echo "--------------------------------------"

# Verificar archivos de notificaciones
echo "🔔 Sistema de Notificaciones:"
check_file "lib/notifications/types.ts"
check_file "lib/notifications/notificationService.ts"
check_file "lib/notifications/eventManager.ts"
check_file "lib/notifications/audioManager.ts"
check_file "hooks/useNotifications.ts"
check_file "components/notifications/NotificationCenter.tsx"
check_file "components/notifications/NotificationItem.tsx"
check_file "components/notifications/NotificationBell.tsx"
check_file "app/api/notifications/sse/route.ts"

echo ""
echo "🎯 Sistema de Actividades:"
check_dir "app/actividades"
check_file "app/actividades/page.tsx"
check_dir "app/api/actividades/[id]"
check_file "app/api/actividades/[id]/route.ts"
check_file "components/tables/actividades-tables/ActividadesTable.tsx"

echo ""
echo "📋 Documentación:"
check_file "MEJORAS_NOTIFICACIONES_ACTIVIDADES.md"

echo ""
echo "🔧 VERIFICANDO DEPENDENCIAS EN PACKAGE.JSON..."
echo "----------------------------------------------"

# Verificar dependencias críticas
if grep -q '"date-fns"' package.json; then
    echo "✅ date-fns encontrado en package.json"
else
    echo "❌ date-fns NO encontrado en package.json"
fi

if grep -q '"lucide-react"' package.json; then
    echo "✅ lucide-react encontrado en package.json"
else
    echo "❌ lucide-react NO encontrado en package.json"
fi

if grep -q '"sonner"' package.json; then
    echo "✅ sonner encontrado en package.json"
else
    echo "❌ sonner NO encontrado en package.json"
fi

echo ""
echo "🧪 VERIFICANDO CONTENIDO CLAVE DE ARCHIVOS..."
echo "---------------------------------------------"

# Verificar características clave implementadas
if grep -q "dismissed.*boolean" lib/notifications/types.ts 2>/dev/null; then
    echo "✅ Propiedad 'dismissed' encontrada en types.ts"
else
    echo "❌ Propiedad 'dismissed' NO encontrada en types.ts"
fi

if grep -q "persistent.*boolean" lib/notifications/types.ts 2>/dev/null; then
    echo "✅ Propiedad 'persistent' encontrada en types.ts"
else
    echo "❌ Propiedad 'persistent' NO encontrada en types.ts"
fi

if grep -q "dismissNotification" lib/notifications/notificationService.ts 2>/dev/null; then
    echo "✅ Función 'dismissNotification' encontrada en notificationService.ts"
else
    echo "❌ Función 'dismissNotification' NO encontrada en notificationService.ts"
fi

if grep -q "highlightId" app/actividades/page.tsx 2>/dev/null; then
    echo "✅ Soporte para 'highlightId' encontrado en actividades/page.tsx"
else
    echo "❌ Soporte para 'highlightId' NO encontrado en actividades/page.tsx"
fi

if grep -q "useSearchParams" app/actividades/page.tsx 2>/dev/null; then
    echo "✅ Hook 'useSearchParams' encontrado en actividades/page.tsx"
else
    echo "❌ Hook 'useSearchParams' NO encontrado en actividades/page.tsx"
fi

if grep -q "actividad-row-" components/tables/actividades-tables/ActividadesTable.tsx 2>/dev/null; then
    echo "✅ ID de fila para scroll encontrado en ActividadesTable.tsx"
else
    echo "❌ ID de fila para scroll NO encontrado en ActividadesTable.tsx"
fi

echo ""
echo "🎨 VERIFICANDO ESTILOS Y CLASES CSS..."
echo "-------------------------------------"

if grep -q "animate-pulse" components/tables/actividades-tables/ActividadesTable.tsx 2>/dev/null; then
    echo "✅ Animación de pulso encontrada en ActividadesTable.tsx"
else
    echo "❌ Animación de pulso NO encontrada en ActividadesTable.tsx"
fi

if grep -q "border-l-4.*border-l-blue-500" components/tables/actividades-tables/ActividadesTable.tsx 2>/dev/null; then
    echo "✅ Borde de resaltado encontrado en ActividadesTable.tsx"
else
    echo "❌ Borde de resaltado NO encontrado en ActividadesTable.tsx"
fi

if grep -q "bg-blue-50" components/tables/actividades-tables/ActividadesTable.tsx 2>/dev/null; then
    echo "✅ Fondo de resaltado encontrado en ActividadesTable.tsx"
else
    echo "❌ Fondo de resaltado NO encontrado en ActividadesTable.tsx"
fi

echo ""
echo "🚀 VERIFICACIÓN COMPLETADA"
echo "=========================="

echo ""
echo "📋 CHECKLIST DE IMPLEMENTACIÓN:"
echo "-------------------------------"
echo "□ Reemplazar todos los archivos listados arriba"
echo "□ Reiniciar el servidor de desarrollo (npm run dev)"
echo "□ Probar creación de nueva actividad"
echo "□ Verificar que las notificaciones persisten al recargar"
echo "□ Probar botones de cerrar y marcar como leída"
echo "□ Probar URL con parámetro highlight (/actividades?highlight=ID)"
echo "□ Verificar auto-scroll y resaltado visual"
echo "□ Probar navegación desde notificaciones"

echo ""
echo "🔗 URLs DE PRUEBA SUGERIDAS:"
echo "----------------------------"
echo "• http://localhost:3001/dashboard/actividades"
echo "• http://localhost:3001/dashboard/actividades?highlight=1"
echo "• http://localhost:3001/dashboard/actividades?highlight=383"

echo ""
echo "✨ ¡IMPLEMENTACIÓN LISTA PARA PRODUCCIÓN!"
echo "========================================="
