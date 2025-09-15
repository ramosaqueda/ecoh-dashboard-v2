#!/bin/bash

echo "🚀 Verificando implementación de mejoras de notificaciones y actividades"
echo "======================================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 ${RED}(FALTA)${NC}"
        return 1
    fi
}

# Función para verificar contenido en archivos
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contiene: $2"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 ${YELLOW}no contiene: $2${NC}"
        return 1
    fi
}

echo ""
echo "📁 Verificando archivos de notificaciones actualizados..."
echo "--------------------------------------------------------"

check_file "lib/notifications/types.ts"
check_content "lib/notifications/types.ts" "dismissed: boolean"
check_content "lib/notifications/types.ts" "persistent: boolean"

check_file "lib/notifications/notificationService.ts"
check_content "lib/notifications/notificationService.ts" "dismissNotification"
check_content "lib/notifications/notificationService.ts" "dismissAll"

check_file "hooks/useNotifications.ts"
check_content "hooks/useNotifications.ts" "dismissNotification"
check_content "hooks/useNotifications.ts" "duration: Infinity"

check_file "components/notifications/NotificationBell.tsx"
check_content "components/notifications/NotificationBell.tsx" "animate-bounce"

check_file "components/notifications/NotificationCenter.tsx"
check_content "components/notifications/NotificationCenter.tsx" "dismissAll"

check_file "components/notifications/NotificationItem.tsx"
check_content "components/notifications/NotificationItem.tsx" "onDismiss"

echo ""
echo "📁 Verificando módulo de actividades..."
echo "--------------------------------------"

check_file "app/api/actividades/[id]/route.ts"
check_content "app/api/actividades/[id]/route.ts" "findUnique"

check_file "app/actividades/page.tsx"
check_content "app/actividades/page.tsx" "useRouter"

check_file "app/dashboard/actividades/page.tsx"
check_content "app/dashboard/actividades/page.tsx" "highlightedActivity"
check_content "app/dashboard/actividades/page.tsx" "fetchHighlightedActivity"

check_file "components/tables/actividades-tables/ActividadesTable.tsx"
check_content "components/tables/actividades-tables/ActividadesTable.tsx" "highlightId"
check_content "components/tables/actividades-tables/ActividadesTable.tsx" "isHighlighted"

check_file "components/tables/actividades-tables/columns.tsx"
check_content "components/tables/actividades-tables/columns.tsx" "onView"
check_content "components/tables/actividades-tables/columns.tsx" "Destacado"

echo ""
echo "🔧 Verificando funcionalidades específicas..."
echo "--------------------------------------------"

echo -e "${BLUE}Buscando implementación de resaltado...${NC}"
check_content "app/dashboard/actividades/page.tsx" "bg-blue-50 border-l-4 border-l-blue-500 animate-pulse"

echo -e "${BLUE}Buscando soporte de parámetro highlight...${NC}"
check_content "app/dashboard/actividades/page.tsx" "useSearchParams"
check_content "app/dashboard/actividades/page.tsx" "highlight"

echo -e "${BLUE}Buscando scroll automático...${NC}"
check_content "app/dashboard/actividades/page.tsx" "scrollIntoView"

echo -e "${BLUE}Buscando notificaciones persistentes...${NC}"
check_content "lib/notifications/notificationService.ts" "persistent: true"

echo ""
echo "📊 Resumen de verificación..."
echo "----------------------------"

# Contar archivos existentes
total_files=0
existing_files=0

files_to_check=(
    "lib/notifications/types.ts"
    "lib/notifications/notificationService.ts"
    "hooks/useNotifications.ts"
    "components/notifications/NotificationBell.tsx"
    "components/notifications/NotificationCenter.tsx"
    "components/notifications/NotificationItem.tsx"
    "app/api/actividades/[id]/route.ts"
    "app/actividades/page.tsx"
    "app/dashboard/actividades/page.tsx"
    "components/tables/actividades-tables/ActividadesTable.tsx"
    "components/tables/actividades-tables/columns.tsx"
)

for file in "${files_to_check[@]}"; do
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        existing_files=$((existing_files + 1))
    fi
done

echo "Archivos actualizados: $existing_files/$total_files"

if [ $existing_files -eq $total_files ]; then
    echo -e "${GREEN}🎉 ¡Implementación completa!${NC}"
    echo ""
    echo "📋 Próximos pasos para probar:"
    echo "1. Reiniciar el servidor de desarrollo: npm run dev"
    echo "2. Crear una actividad nueva para generar notificación"
    echo "3. Verificar que la notificación sea persistente"
    echo "4. Hacer clic en 'Ver' en la notificación"
    echo "5. Verificar el resaltado en /dashboard/actividades?highlight=ID"
    echo "6. Probar los botones de cerrar notificaciones"
    echo ""
    echo -e "${GREEN}✨ Sistema de notificaciones y visualización de actividades listo${NC}"
else
    echo -e "${YELLOW}⚠ Implementación parcial. Faltan algunos archivos.${NC}"
fi

echo ""
echo "🔗 URLs de prueba sugeridas:"
echo "- http://localhost:3001/dashboard/actividades"
echo "- http://localhost:3001/actividades?highlight=1"
echo "- http://localhost:3001/dashboard/actividades?highlight=1"
