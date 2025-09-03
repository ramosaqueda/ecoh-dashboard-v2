@echo off
echo ========================================
echo    FINALIZAR ACTUALIZACION
echo ========================================
echo.

set /p confirm="¿El nuevo contenedor funciona correctamente? (s/N): "
if /i not "%confirm%"=="s" (
    echo Por favor verifica el funcionamiento primero.
    pause
    exit /b 0
)

echo [INFO] Eliminando contenedor antiguo...
docker rm ecoh-app 2>nul

echo [INFO] Renombrando contenedor nuevo...
docker stop ecoh-app-new
docker rename ecoh-app-new ecoh-app
docker start ecoh-app

echo [INFO] Limpiando imagenes y contenedores no utilizados...
docker container prune -f
docker image prune -f

echo [INFO] Respaldando archivos de configuracion antiguos...
if exist "Dockerfile" (
    move "Dockerfile" "Dockerfile.old.%date:~-4,4%%date:~-10,2%%date:~-7,2%" 2>nul
)
if exist "docker-compose.yml" (
    move "docker-compose.yml" "docker-compose.old.%date:~-4,4%%date:~-10,2%%date:~-7,2%.yml" 2>nul
)

echo [INFO] Activando nuevas configuraciones...
if exist "Dockerfile.new" (
    move "Dockerfile.new" "Dockerfile" 2>nul
)
if exist "docker-compose.new.yml" (
    move "docker-compose.new.yml" "docker-compose.yml" 2>nul
)

echo.
echo [SUCCESS] Actualizacion completada exitosamente!
echo.
echo Estado final:
echo - Contenedor: ecoh-app (actualizado)
echo - Puerto: 3000
echo - Configuraciones: actualizadas
echo - Respaldos: creados con fecha
echo.
echo El sistema esta listo con todas las nuevas funcionalidades.
echo.
pause