@echo off
echo ========================================
echo    RECONSTRUIR DESDE RAMA MAIN
echo ========================================
echo.

echo [INFO] Verificando rama actual de Git...
git branch --show-current

echo.
echo [INFO] Verificando estado del repositorio...
git status --porcelain

echo.
echo [INFO] ¿Cambiar a rama main y reconstruir? ^(s/N^):
set /p proceed=

if /i not "%proceed%"=="s" (
    echo Operacion cancelada
    pause
    exit /b 0
)

echo.
echo [INFO] PASO 1: Guardando cambios locales si los hay...
git stash push -m "Backup antes de cambiar a main"

echo [INFO] PASO 2: Cambiando a rama main...
git checkout main
if errorlevel 1 (
    echo [ERROR] No se pudo cambiar a main
    echo ¿La rama se llama diferente? ^(master, develop, etc.^)
    pause
    exit /b 1
)

echo [INFO] PASO 3: Actualizando rama main...
git pull origin main

echo [INFO] PASO 4: Deteniendo contenedor actual...
docker stop ecoh-app 2>nul

echo [INFO] PASO 5: Construyendo nueva imagen desde main...
docker build -t ecoh-dashboard-main:latest .
if errorlevel 1 (
    echo [ERROR] Error en construccion de imagen
    pause
    exit /b 1
)

echo [INFO] PASO 6: Creando contenedor con imagen de main...
docker run -d --name ecoh-app ^
    -p 3000:3000 ^
    --restart unless-stopped ^
    --env-file .env ^
    ecoh-dashboard-main:latest

if errorlevel 1 (
    echo [WARNING] Error con --env-file, intentando sin el...
    docker rm ecoh-app 2>nul
    docker run -d --name ecoh-app ^
        -p 3000:3000 ^
        --restart unless-stopped ^
        ecoh-dashboard-main:latest
)

echo.
echo [INFO] PASO 7: Esperando inicio de aplicacion...
timeout /t 30 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app --tail 15

echo.
echo [INFO] Probando conexion...
curl -I http://localhost:3000 2>nul
if errorlevel 1 (
    echo [INFO] Aun no responde, esperando un poco mas...
    timeout /t 30 /nobreak >nul
    curl -I http://localhost:3000 2>nul
    if errorlevel 1 (
        echo [WARNING] No responde, revisa los logs arriba
    ) else (
        echo [SUCCESS] Aplicacion funcionando en http://localhost:3000
    )
) else (
    echo [SUCCESS] Aplicacion funcionando en http://localhost:3000
)

echo.
echo [INFO] Estado final:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr ecoh-app

echo.
echo ========================================
echo    RECONSTRUCCION COMPLETADA
echo ========================================
echo.
echo Rama actual: 
git branch --show-current
echo.
echo Si funciona correctamente:
echo - Tu aplicacion esta corriendo desde la rama main
echo - La imagen se llama: ecoh-dashboard-main:latest
echo.
echo Si necesitas volver a la rama anterior:
echo git stash list   ^(para ver el backup^)
echo git checkout nombre_rama_anterior
echo git stash pop    ^(para restaurar cambios^)
echo.
pause