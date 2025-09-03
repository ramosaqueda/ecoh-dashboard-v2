@echo off
echo ========================================
echo    RESTAURAR DESDE BACKUP ORIGINAL
echo ========================================
echo.

echo [INFO] Verificando si existe el backup del contenedor original...
docker images | findstr "ecoh-app-backup"
if errorlevel 1 (
    echo [ERROR] No se encontró backup ecoh-app-backup:latest
    echo [INFO] El script build-safe.bat no pudo crear el backup
    echo.
    echo Buscando otras imágenes disponibles...
    docker images | findstr ecoh
    pause
    exit /b 1
)

echo [SUCCESS] Backup encontrado: ecoh-app-backup:latest
echo.

echo [INFO] Deteniendo contenedor actual problemático...
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

echo [INFO] Creando contenedor desde el BACKUP ORIGINAL...
docker run -d --name ecoh-app ^
    -p 3000:3000 ^
    --restart unless-stopped ^
    ecoh-app-backup:latest

if errorlevel 1 (
    echo [ERROR] Error al crear contenedor desde backup
    pause
    exit /b 1
)

echo [SUCCESS] Contenedor restaurado desde backup original

echo [INFO] Esperando 20 segundos para inicio completo...
timeout /t 20 /nobreak >nul

echo [INFO] Verificando funcionamiento...
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No responde aún, verificando logs...
    docker logs ecoh-app --tail 15
) else (
    echo [SUCCESS] ¡FUNCIONANDO! Tu sistema original está restaurado
    echo [SUCCESS] Accede en: http://localhost:3000
)

echo.
echo [INFO] Estado del contenedor:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr ecoh-app

echo.
echo ========================================
echo    CONTENEDOR ORIGINAL RESTAURADO
echo ========================================
echo.
echo Tu aplicación debería funcionar exactamente como antes
echo de que ejecutáramos el build-safe.bat problemático.
echo.
pause