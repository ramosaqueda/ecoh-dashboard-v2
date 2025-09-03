@echo off
echo ========================================
echo    DIAGNOSTICO DE CONTENEDORES
echo ========================================
echo.

echo [INFO] Verificando contenedores activos...
echo.
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo.
echo [INFO] Verificando todos los contenedores (incluyendo detenidos)...
echo.
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo.
echo [INFO] Verificando procesos en puerto 3000...
echo.
netstat -ano | findstr :3000

echo.
echo ========================================
echo    SOLUCION SUGERIDA
echo ========================================
echo.
echo Si ves dos contenedores en puerto 3000, ejecuta:
echo.
echo 1. Para detener el contenedor antiguo:
echo    docker stop ecoh-app
echo.
echo 2. Para reiniciar el nuevo:
echo    docker restart ecoh-app-v2
echo.
echo 3. O cambiar el puerto del nuevo contenedor:
echo    docker stop ecoh-app-v2
echo    docker run -d --name ecoh-app-v2-test -p 3001:3000 ecoh-dashboard:latest
echo.
pause