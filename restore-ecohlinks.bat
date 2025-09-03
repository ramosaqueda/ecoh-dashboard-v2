@echo off
echo ========================================
echo    RESTAURAR ECOHLINKS-APP URGENTE
echo ========================================
echo.

echo [INFO] Restaurando contenedor ecohlinks-app que se cerró por error...

echo [INFO] Verificando si el contenedor existe pero está detenido...
docker ps -a | findstr ecohlinks-app
if not errorlevel 1 (
    echo [INFO] Contenedor existe, intentando reiniciar...
    docker start ecohlinks-app
    if not errorlevel 1 (
        echo [SUCCESS] ecohlinks-app reiniciado correctamente
        goto :verify
    )
)

echo [INFO] Recreando contenedor ecohlinks-app desde la imagen...
docker run -d --name ecohlinks-app ^
    -p 8082:8082 ^
    --restart unless-stopped ^
    ecohlinks-app:latest

if errorlevel 1 (
    echo [ERROR] Error al recrear ecohlinks-app
    echo [INFO] Intentando con configuración alternativa...
    docker run -d --name ecohlinks-app-restored ^
        -p 8082:8082 ^
        ecohlinks-app:latest
)

:verify
echo.
echo [INFO] Verificando estado de ecohlinks-app...
timeout /t 5 /nobreak >nul
docker ps | findstr ecohlinks
if errorlevel 1 (
    echo [ERROR] ecohlinks-app no está corriendo
    docker logs ecohlinks-app --tail 10
) else (
    echo [SUCCESS] ecohlinks-app está corriendo correctamente
)

echo.
echo [INFO] Probando conexión al puerto 8082...
curl -f http://localhost:8082 >nul 2>&1
if errorlevel 1 (
    echo [INFO] No responde aún, pero el contenedor está iniciando
) else (
    echo [SUCCESS] ecohlinks-app respondiendo en http://localhost:8082
)

echo.
echo [INFO] Estado final de ecohlinks:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr ecohlinks

echo.
echo ========================================
echo    ECOHLINKS-APP RESTAURADO
echo ========================================
pause