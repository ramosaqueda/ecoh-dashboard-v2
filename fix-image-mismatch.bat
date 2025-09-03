@echo off
echo ========================================
echo    VERIFICAR IMAGEN VS CODIGO ACTUAL
echo ========================================
echo.

echo [INFO] Imagen actual del contenedor:
docker inspect ecoh-app --format="{{.Config.Image}}"

echo.
echo [INFO] Fecha de creacion de la imagen:
docker inspect ecoh-dashboard:latest --format="{{.Created}}"

echo.
echo [INFO] Comparando con imagen alternativa (Aug 7):
docker inspect ecoh-dashboard-app:latest --format="{{.Created}}" 2>nul
if errorlevel 1 (
    echo [INFO] Imagen ecoh-dashboard-app no disponible
) else (
    echo [SUCCESS] Imagen del 7 de agosto disponible
)

echo.
echo [INFO] Hash de la imagen actual vs disponibles:
docker images ecoh-dashboard --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}"

echo.
echo ========================================
echo    SOLUCION RECOMENDADA
echo ========================================
echo.
echo El problema es que la imagen actual tiene CODIGO MAS NUEVO
echo que espera una BD con estructura diferente a SAC.
echo.
echo OPCIONES:
echo.
echo 1. USAR IMAGEN MAS ANTIGUA (recomendado):
echo    docker stop ecoh-app
echo    docker rm ecoh-app
echo    docker run -d --name ecoh-app -p 3000:3000 ecoh-dashboard-app:latest
echo.
echo 2. ACTUALIZAR BD SAC con migraciones del codigo nuevo:
echo    - Pero esto puede modificar/dañar los datos
echo.
echo 3. USAR BD ORIGINAL en lugar de SAC:
echo    - Cambiar DATABASE_URL en variables de entorno
echo.
echo ¿Que opcion prefieres? ^(1/2/3^):
set /p option=

if "%option%"=="1" (
    echo [INFO] Cambiando a imagen mas antigua...
    docker stop ecoh-app
    docker rm ecoh-app
    docker run -d --name ecoh-app ^
        -p 3000:3000 ^
        --restart unless-stopped ^
        ecoh-dashboard-app:latest
    
    timeout /t 15 /nobreak >nul
    echo [INFO] Probando con imagen antigua...
    curl -s http://localhost:3000/api/health
)

if "%option%"=="2" (
    echo [WARNING] Esto puede modificar tu BD SAC
    echo [INFO] ¿Continuar? ^(s/N^):
    set /p confirm=
    if /i "!confirm!"=="s" (
        echo [INFO] Aplicando migraciones dentro del contenedor...
        docker exec -it ecoh-app npx prisma migrate deploy
        docker restart ecoh-app
    )
)

if "%option%"=="3" (
    echo [INFO] ¿Cual es el nombre de tu BD original?
    set /p original_db="Nombre de BD original: "
    
    docker stop ecoh-app
    docker rm ecoh-app
    docker run -d --name ecoh-app ^
        -p 3000:3000 ^
        --restart unless-stopped ^
        -e DATABASE_URL=postgresql://postgres:r1101kcn@host.docker.internal:5432/!original_db!?schema=public ^
        ecoh-dashboard:latest
)

echo.
pause