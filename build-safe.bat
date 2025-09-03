@echo off
echo ========================================
echo    CONSTRUCCION SEGURA ECOH INSIGHT
echo ========================================
echo.

echo [INFO] Verificando archivos Docker...
if not exist "Dockerfile.new" (
    echo [ERROR] Archivo Dockerfile.new no encontrado
    pause
    exit /b 1
)

if not exist "docker-compose.new.yml" (
    echo [ERROR] Archivo docker-compose.new.yml no encontrado
    pause
    exit /b 1
)

echo [INFO] Creando backup del contenedor actual...
docker stop ecoh-app 2>nul
docker commit ecoh-app ecoh-app-backup:latest 2>nul

echo [INFO] Construyendo nueva imagen (version completa)...
docker build -f Dockerfile.new -t ecoh-dashboard:latest .
if errorlevel 1 (
    echo [WARNING] Error en la construccion completa, probando version simple...
    docker build -f Dockerfile.simple -t ecoh-dashboard:latest .
    if errorlevel 1 (
        echo [ERROR] Error en ambas construcciones
        pause
        exit /b 1
    )
    echo [SUCCESS] Construccion simple exitosa!
) else (
    echo [SUCCESS] Construccion completa exitosa!
)

echo [INFO] Probando contenedor...
docker-compose -f docker-compose.new.yml up -d
if errorlevel 1 (
    echo [ERROR] Error al iniciar el contenedor
    echo [INFO] Restaurando contenedor anterior...
    docker stop ecoh-app-v2 2>nul
    docker start ecoh-app 2>nul
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Contenedor construido exitosamente!
echo [INFO] Nombre del nuevo contenedor: ecoh-app-v2
echo [INFO] Puerto: 3000
echo.
echo Esperando 10 segundos para que inicie completamente...
timeout /t 10 /nobreak >nul

echo Verificando estado del contenedor...
docker ps | findstr ecoh-app-v2
if errorlevel 1 (
    echo [WARNING] El contenedor podria no estar corriendo correctamente
    echo [INFO] Revisando logs...
    docker logs ecoh-app-v2
) else (
    echo [SUCCESS] Contenedor ejecutandose correctamente!
)

echo.
echo Para verificar funcionamiento:
echo 1. Abrir: http://localhost:3000
echo 2. Si funciona bien: ejecutar apply-changes.bat
echo 3. Para ver logs: docker logs ecoh-app-v2
echo.
pause