#!/bin/bash

# Script para verificar el sistema de notificaciones restaurado
echo "🔔 VERIFICANDO SISTEMA DE NOTIFICACIONES RESTAURADO"
echo "=================================================="

# Verificar archivos críticos
echo ""
echo "📁 VERIFICANDO ARCHIVOS:"

files=(
    "app/api/notifications/sse/route.ts"
    "app/api/notifications/test/route.ts"
    "lib/notifications/server/notificationGenerator.ts"
    "lib/notifications/server/notificationSender.ts"
    "lib/notifications/notificationService.ts"
    "lib/notifications/eventManager.ts"
    "lib/notifications/audioManager.ts"
    "lib/notifications/types.ts"
    "hooks/useNotifications.ts"
    "components/notifications/NotificationBell.tsx"
    "components/debug/TestNotificationButton.tsx"
    "components/layout/header.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
    fi
done

echo ""
echo "🔧 PASOS PARA PROBAR:"
echo "===================="
echo ""
echo "1. Reiniciar el servidor:"
echo "   npm run dev"
echo ""
echo "2. Abrir el navegador en modo desarrollo"
echo ""
echo "3. Verificar en el header:"
echo "   - Botón '🧪 Probar Notificación' (solo desarrollo)"
echo "   - Campana de notificaciones 🔔"
echo ""
echo "4. Probar notificaciones manuales:"
echo "   - Hacer clic en '🧪 Probar Notificación'"
echo "   - Verificar que aparece toast persistente"
echo "   - Verificar contador en campana"
echo "   - Abrir centro de notificaciones"
echo ""
echo "5. Probar creación de actividad:"
echo "   - Ir a página de actividades"
echo "   - Crear nueva actividad"
echo "   - Asignar a otro usuario"
echo "   - Verificar que se genera notificación automáticamente"
echo ""
echo "6. Probar SSE en consola del navegador:"
echo "   console.log('Conexiones SSE:', window.EventSource)"
echo ""
echo "🐛 DEBUGGING:"
echo "============"
echo ""
echo "Si no aparecen notificaciones automáticas:"
echo "1. Abrir DevTools → Network → EventSource"
echo "2. Verificar conexión a /api/notifications/sse"
echo "3. Revisar consola del servidor para logs 📬"
echo "4. Verificar que usuarios tienen clerk_id válido"
echo ""
echo "Logs importantes a buscar:"
echo "- '📡 Conexión SSE establecida'"
echo "- '📬 Notificación enviada para nueva actividad'"
echo "- '🔔 GENERAR NOTIFICACIÓN AUTOMÁTICAMENTE'"
echo ""
echo "✅ SISTEMA RESTAURADO Y LISTO PARA PRUEBAS"
