@echo off
echo ========================================
echo    BUSCAR ALTERNATIVAS DE RECUPERACION
echo ========================================
echo.

echo [INFO] Listando todas las imagenes disponibles...
echo.
echo Imagenes ecoh disponibles:
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}" | findstr ecoh

echo.
echo [INFO] Verificando si existe imagen del 7 de agosto...
docker images | findstr "ecoh-dashboard-app"
if not errorlevel 1 (
    echo [SUCCESS] Imagen ecoh-dashboard-app encontrada - Esta podria funcionar
    set older_image_exists=1
) else (
    echo [INFO] Imagen ecoh-dashboard-app no encontrada
    set older_image_exists=0
)

echo.
echo [INFO] Verificando otras imagenes ecoh...
for /f "tokens=1,2" %%a in ('docker images --format "{{.Repository}} {{.Tag}}" ^| findstr ecoh') do (
    echo Encontrada: %%a:%%b
)

echo.
echo ========================================
echo    OPCIONES DE RECUPERACION
echo ========================================
echo.

if "%older_image_exists%"=="1" (
    echo OPCION 1: Usar imagen del 7 de agosto ^(ecoh-dashboard-app^)
    echo docker run -d --name ecoh-app -p 3000:3000 ecoh-dashboard-app:latest
    echo.
)

echo OPCION 2: Reconstruir desde codigo en estado funcional
echo ^(requiere identificar commit que funcionaba^)
echo.
echo OPCION 3: Volver a desarrollo local ^(yarn dev^)
echo.
echo OPCION 4: Usar imagen actual pero con BD original
echo ^(cambiar de SAC a tu BD original^)
echo.

set /p recovery_choice="¿Que opcion prefieres? (1/2/3/4): "

if "%recovery_choice%"=="1" (
    if "%older_image_exists%"=="1" (
        echo [INFO] Usando imagen del 7 de agosto...
        docker stop ecoh-app 2>nul
        docker rm ecoh-app 2>nul
        docker run -d --name ecoh-app -p 3000:3000 --restart unless-stopped ecoh-dashboard-app:latest
        
        timeout /t 20 /nobreak >nul
        curl -f http://localhost:3000 >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] ¡Funcionando con imagen del 7 de agosto!
        ) else (
            echo [INFO] Aun no responde, verificando logs...
            docker logs ecoh-app --tail 10
        )
    ) else (
        echo [ERROR] Imagen ecoh-dashboard-app no disponible
    )
)

if "%recovery_choice%"=="3" (
    echo [INFO] Configurando para desarrollo local...
    echo.
    echo Pasos para volver a desarrollo local:
    echo 1. Detener contenedores Docker
    echo 2. Configurar .env para BD local
    echo 3. npm install
    echo 4. npx prisma generate  
    echo 5. npm run dev
    echo.
    echo ¿Detener contenedores y configurar para local? ^(s/N^):
    set /p setup_local=
    if /i "!setup_local!"=="s" (
        docker stop ecoh-app 2>nul
        docker rm ecoh-app 2>nul
        echo [SUCCESS] Contenedores detenidos
        echo Ahora ejecuta: npm run dev
    )
)

if "%recovery_choice%"=="4" (
    echo [INFO] ¿Cual era el nombre de tu base de datos original?
    set /p original_db="Nombre de BD original: "
    
    docker stop ecoh-app 2>nul
    docker rm ecoh-app 2>nul
    docker run -d --name ecoh-app -p 3000:3000 ^
        -e DATABASE_URL=postgresql://postgres:r1101kcn@host.docker.internal:5432/!original_db!?schema=public ^
        ecoh-dashboard:latest
    
    timeout /t 20 /nobreak >nul
    echo [INFO] Probando con BD original...
    curl -f http://localhost:3000 >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Funcionando con BD original
    ) else (
        docker logs ecoh-app --tail 10
    )
)

echo.
pause