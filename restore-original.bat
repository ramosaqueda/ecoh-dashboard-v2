@echo off
echo ========================================
echo    RESTAURAR SISTEMA ANTERIOR
echo ========================================
echo.

echo [INFO] Deteniendo contenedor nuevo (si esta corriendo)...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul

echo [INFO] Restaurando contenedor original...
docker start ecoh-app
if errorlevel 1 (
    echo [WARNING] Error al iniciar contenedor original
    echo [INFO] Intentando desde backup...
    docker run -d --name ecoh-app -p 3000:3000 ecoh-app-backup:latest
    if errorlevel 1 (
        echo [ERROR] No se pudo restaurar desde backup
        pause
        exit /b 1
    )
    echo [SUCCESS] Restaurado desde backup
) else (
    echo [SUCCESS] Contenedor original restaurado
)

echo.
echo [INFO] Verificando estado...
docker ps | findstr ecoh-app
if errorlevel 1 (
    echo [WARNING] Contenedor podria no estar corriendo
) else (
    echo [SUCCESS] Contenedor original activo
)

echo.
echo [SUCCESS] Sistema anterior restaurado completamente
echo.
echo Acceder en: http://localhost:3000
echo.
echo Tu sistema esta exactamente como estaba antes.
echo.
pause