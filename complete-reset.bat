@echo off
echo ========================================
echo    VUELTA AL ESTADO INICIAL
echo ========================================
echo.

echo [WARNING] Este script va a:
echo - Detener TODOS los contenedores de ecoh
echo - Eliminar contenedores problemáticos
echo - Limpiar imágenes y volúmenes temporales
echo - Intentar volver al estado que funcionaba antes
echo.

set /p confirm="¿Continuar con la limpieza completa? (s/N): "
if /i not "%confirm%"=="s" (
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [INFO] PASO 1: Deteniendo todos los contenedores relacionados...
docker stop ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul

echo [INFO] PASO 2: Eliminando contenedores problemáticos...
docker rm ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul

echo [INFO] PASO 3: Verificando qué imágenes tienes disponibles...
echo.
echo Imágenes disponibles:
docker images | findstr ecoh
echo.

echo [INFO] PASO 4: ¿Cuál era la configuración que funcionaba?
echo.
echo OPCIONES:
echo 1. No tenías Docker antes (usar yarn dev)
echo 2. Tenías un contenedor que funcionaba (indicar cuál imagen)
echo 3. Usar docker-compose como estaba originalmente
echo.
set /p restore_option="¿Qué opción describe mejor tu estado anterior? (1/2/3): "

if "%restore_option%"=="1" (
    echo [INFO] Configurando para desarrollo local sin Docker...
    echo.
    echo Para volver al desarrollo local:
    echo 1. Asegurar que PostgreSQL esté corriendo localmente
    echo 2. Configurar .env para conexión local
    echo 3. Ejecutar: npm install
    echo 4. Ejecutar: npx prisma generate
    echo 5. Ejecutar: npm run dev
    echo.
    echo ¿Configurar .env para desarrollo local? ^(s/N^):
    set /p setup_local=
    if /i "!setup_local!"=="s" (
        echo DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/tu_bd?schema=public > .env.local
        echo NODE_ENV=development >> .env.local
        echo [SUCCESS] Archivo .env.local creado
        echo Edita las credenciales de BD y ejecuta: npm run dev
    )
)

if "%restore_option%"=="2" (
    echo [INFO] ¿Cuál imagen funcionaba? ^(ej: ecoh-dashboard, ecoh-dashboard-app^):
    set /p working_image="Nombre de imagen: "
    
    echo [INFO] Creando contenedor con imagen que funcionaba...
    docker run -d --name ecoh-app ^
        -p 3000:3000 ^
        --restart unless-stopped ^
        !working_image!:latest
    
    if not errorlevel 1 (
        echo [SUCCESS] Contenedor creado con imagen !working_image!
        timeout /t 15 /nobreak >nul
        curl -f http://localhost:3000 >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] ¡Aplicación funcionando en http://localhost:3000!
        ) else (
            echo [WARNING] Contenedor creado pero no responde aún
        )
    )
)

if "%restore_option%"=="3" (
    echo [INFO] Usando docker-compose original...
    docker-compose down 2>nul
    docker-compose up -d
    
    timeout /t 30 /nobreak >nul
    docker logs ecoh-app --tail 10
)

echo.
echo [INFO] PASO 5: Limpiando archivos temporales...
del /q Dockerfile.new Dockerfile.simple docker-compose.new.yml 2>nul
del /q .env.development test-*.bat diagnose-*.bat fix-*.bat 2>nul

echo.
echo [INFO] Estado final:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ========================================
echo    RESTAURACIÓN COMPLETA
echo ========================================
echo.
echo Tu sistema debería estar ahora en un estado limpio.
echo Si funciona, NO TOQUES NADA más por ahora.
echo.
pause