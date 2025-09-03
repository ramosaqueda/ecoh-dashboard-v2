@echo off
echo ========================================
echo    APLICAR CAMBIOS PERMANENTEMENTE
echo ========================================
echo.

set /p confirm="¿Estas seguro de aplicar los cambios? (s/N): "
if /i not "%confirm%"=="s" (
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo [INFO] Deteniendo contenedor anterior...
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

echo [INFO] Renombrando archivos...
move "Dockerfile" "Dockerfile.old" 2>nul
move "docker-compose.yml" "docker-compose.old.yml" 2>nul
move "Dockerfile.new" "Dockerfile"
move "docker-compose.new.yml" "docker-compose.yml"

echo [INFO] Renombrando contenedor...
docker stop ecoh-app-v2
docker rename ecoh-app-v2 ecoh-app
docker start ecoh-app

echo [INFO] Limpiando imagenes antiguas...
docker image prune -f
docker volume prune -f

echo.
echo [SUCCESS] Cambios aplicados permanentemente!
echo [INFO] El contenedor ahora usa las nuevas configuraciones
echo [INFO] Archivos antiguos guardados como *.old
echo.
pause