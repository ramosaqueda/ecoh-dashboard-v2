@echo off
echo 🧹 Eliminando archivos de Debug y Testing...

:: Eliminar componente de debug
if exist "components\analytics\DebugNotificaciones.tsx" (
    del "components\analytics\DebugNotificaciones.tsx"
    echo ✅ Eliminado: DebugNotificaciones.tsx
) else (
    echo ⚠️  No encontrado: DebugNotificaciones.tsx
)

:: Eliminar APIs de debug/testing
if exist "app\api\notificaciones\debug" (
    rmdir /s /q "app\api\notificaciones\debug"
    echo ✅ Eliminada carpeta: debug
) else (
    echo ⚠️  No encontrada carpeta: debug
)

if exist "app\api\notificaciones\test-asignacion" (
    rmdir /s /q "app\api\notificaciones\test-asignacion"
    echo ✅ Eliminada carpeta: test-asignacion
) else (
    echo ⚠️  No encontrada carpeta: test-asignacion
)

if exist "app\api\notificaciones\test-cambio-estado" (
    rmdir /s /q "app\api\notificaciones\test-cambio-estado"
    echo ✅ Eliminada carpeta: test-cambio-estado
) else (
    echo ⚠️  No encontrada carpeta: test-cambio-estado
)

if exist "app\api\notificaciones\verificar-asignaciones" (
    rmdir /s /q "app\api\notificaciones\verificar-asignaciones"
    echo ✅ Eliminada carpeta: verificar-asignaciones
) else (
    echo ⚠️  No encontrada carpeta: verificar-asignaciones
)

echo.
echo 🎉 ¡Limpieza completada!
echo 🚀 Sistema listo para producción sin simulaciones
echo.
pause
