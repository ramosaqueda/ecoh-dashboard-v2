@echo off
echo ========================================
echo    ESTADO DE CONTENEDORES
echo ========================================
echo.

echo [INFO] Contenedores activos:
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo.
echo [INFO] Todos los contenedores (incluyendo detenidos):
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo.
echo [INFO] Imagenes disponibles:
docker images | findstr ecoh

echo.
echo ========================================
echo    OPCIONES DISPONIBLES
echo ========================================
echo.
echo 1. restore-original.bat     - Restaurar sistema anterior (100%% seguro)
echo 2. diagnose-database.bat    - Diagnosticar problema con BD SAC
echo 3. restart-with-localhost.bat - Probar nueva version con localhost
echo.
echo Tu contenedor original esta SEGURO y puede restaurarse en cualquier momento.
echo.
pause