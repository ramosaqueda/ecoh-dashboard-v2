@echo off
echo 🔄 RESTAURANDO ARCHIVO ORIGINAL...
echo ====================================

REM Backup del archivo actual (mi implementación)
echo 💾 Creando backup del archivo actual...
copy "app\api\actividades\[id]\route.ts" "app\api\actividades\[id]\route.ts.claude-backup"

REM Restaurar desde Git
echo 🔄 Restaurando desde Git (commit 266619f)...
git checkout 266619f -- "app/api/actividades/[id]/route.ts"

REM Verificar si la restauración fue exitosa
if %ERRORLEVEL% EQU 0 (
    echo ✅ Archivo restaurado exitosamente!
    echo 📋 Archivos disponibles:
    echo    - route.ts (ORIGINAL restaurado)
    echo    - route.ts.claude-backup (mi implementación)
    echo    - route.ts.my-backup (backup adicional)
) else (
    echo ❌ Error en la restauración. Código: %ERRORLEVEL%
    echo 🔄 Restaurando manualmente desde backup...
    copy "app\api\actividades\[id]\route.ts.claude-backup" "app\api\actividades\[id]\route.ts"
)

echo.
echo 🎯 SIGUIENTE PASO: Revisar el archivo original y crear solución compatible
pause
