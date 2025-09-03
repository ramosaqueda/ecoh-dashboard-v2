@echo off
echo ========================================
echo    RECONSTRUIR CONTENEDOR DESDE CERO
echo ========================================
echo.

echo [INFO] Paso 1: Limpiando todo completamente...
docker stop ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul
docker rm ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul

echo [INFO] Paso 2: Verificando archivos necesarios...
if not exist "Dockerfile" (
    echo [ERROR] Dockerfile no encontrado
    pause
    exit /b 1
)

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml no encontrado  
    pause
    exit /b 1
)

if not exist ".env" (
    echo [ERROR] .env no encontrado
    pause
    exit /b 1
)

echo [SUCCESS] Archivos necesarios encontrados

echo [INFO] Paso 3: Verificando variables de entorno...
type .env

echo.
echo [INFO] Paso 4: Construyendo imagen desde cero...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Error en la construccion
    pause
    exit /b 1
)

echo [SUCCESS] Imagen construida exitosamente

echo [INFO] Paso 5: Iniciando contenedor...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Error al iniciar contenedor
    pause
    exit /b 1
)

echo [SUCCESS] Contenedor iniciado

echo [INFO] Paso 6: Esperando inicio completo (30 segundos)...
timeout /t 30 /nobreak >nul

echo [INFO] Paso 7: Verificando estado...
docker ps | findstr ecoh-app
if errorlevel 1 (
    echo [ERROR] Contenedor no esta corriendo
    echo [INFO] Verificando logs...
    docker logs ecoh-app
) else (
    echo [SUCCESS] Contenedor corriendo correctamente
)

echo [INFO] Paso 8: Probando conexion...
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No se puede conectar al puerto 3000
    echo [INFO] Verificando logs detallados...
    docker logs ecoh-app --tail 20
) else (
    echo [SUCCESS] Aplicacion respondiendo en puerto 3000
)

echo.
echo ========================================
echo    RESULTADO FINAL
echo ========================================
echo.
echo Contenedor: ecoh-app
echo Puerto: 3000
echo URL: http://localhost:3000
echo.
echo Para ver logs: docker logs ecoh-app
echo Para detener: docker-compose down
echo.
pause