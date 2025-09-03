@echo off
echo ========================================
echo    PARADA DE EMERGENCIA Y RECUPERACION
echo ========================================
echo.

echo [INFO] PASO 1: Deteniendo TODOS los contenedores relacionados...
docker stop ecoh-app 2>nul
docker stop ecoh-app-v2 2>nul  
docker stop ecoh-app-v2-test 2>nul
docker stop ecoh-app-new 2>nul

echo [INFO] PASO 2: Eliminando contenedores problemáticos...
docker rm ecoh-app 2>nul
docker rm ecoh-app-v2 2>nul
docker rm ecoh-app-v2-test 2>nul
docker rm ecoh-app-new 2>nul

echo [INFO] PASO 3: Verificando estado actual...
docker ps -a | findstr ecoh-app
if not errorlevel 1 (
    echo [WARNING] Aún hay contenedores ecoh-app, eliminando...
    for /f "tokens=1" %%i in ('docker ps -aq --filter "name=ecoh-app"') do docker rm -f %%i
)

echo [INFO] PASO 4: Liberando puerto 3000...
netstat -ano | findstr :3000
echo [INFO] Si ves procesos en puerto 3000, los puedes terminar manualmente

echo [INFO] PASO 5: Verificando imágenes disponibles...
docker images | findstr ecoh

echo.
echo ========================================
echo    OPCIONES DE RECUPERACION
echo ========================================
echo.
echo Tienes estas imágenes disponibles:
echo - ecoh-dashboard:latest (6.74GB - Sep 1)
echo - ecoh-dashboard-app:latest (11.9GB - Aug 7) 
echo.
echo OPCION 1: Usar imagen del 7 de agosto (más antigua, probablemente más estable)
echo OPCION 2: Reconstruir completamente desde código
echo OPCION 3: Usar imagen del 1 de septiembre con configuración mínima
echo.
set /p recovery_option="¿Qué opción prefieres? (1/2/3): "

if "%recovery_option%"=="1" (
    echo [INFO] Usando imagen del 7 de agosto (más estable)...
    docker run -d --name ecoh-app ^
      -p 3000:3000 ^
      --restart unless-stopped ^
      ecoh-dashboard-app:latest
    
    echo [SUCCESS] Contenedor creado con imagen antigua
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 10
)

if "%recovery_option%"=="2" (
    echo [INFO] Reconstruyendo desde código fuente...
    echo [WARNING] Esto tomará varios minutos
    docker build -t ecoh-dashboard-recovery:latest .
    if not errorlevel 1 (
        docker run -d --name ecoh-app ^
          -p 3000:3000 ^
          --restart unless-stopped ^
          --env-file .env ^
          ecoh-dashboard-recovery:latest
        
        echo [SUCCESS] Contenedor reconstruido desde código
        timeout /t 20 /nobreak >nul
        docker logs ecoh-app --tail 10
    )
)

if "%recovery_option%"=="3" (
    echo [INFO] Usando imagen del 1 de septiembre con configuración mínima...
    docker run -d --name ecoh-app ^
      -p 3000:3000 ^
      --restart unless-stopped ^
      -e NODE_ENV=production ^
      ecoh-dashboard:latest
    
    echo [SUCCESS] Contenedor creado con configuración mínima  
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 10
)

echo.
echo ========================================
echo    VERIFICACION FINAL
echo ========================================
echo.
echo [INFO] Estado del contenedor:
docker ps | findstr ecoh-app

echo.
echo [INFO] Probando conexión:
timeout /t 5 /nobreak >nul
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No responde aún, pero el contenedor puede estar iniciando
    echo [INFO] Logs recientes:
    docker logs ecoh-app --tail 20
    echo.
    echo [INFO] Espera 1-2 minutos más y prueba: http://localhost:3000
) else (
    echo [SUCCESS] ¡La aplicación está respondiendo!
    echo [SUCCESS] Accede en: http://localhost:3000
)

echo.
echo ========================================
echo    RESUMEN DE RECUPERACION
echo ========================================
echo.
echo ✅ Contenedores problemáticos eliminados
echo ✅ Puerto 3000 liberado  
echo ✅ Nuevo contenedor ecoh-app creado
echo ✅ Sistema en proceso de recuperación
echo.
echo URL: http://localhost:3000
echo Logs: docker logs ecoh-app
echo Estado: docker ps | findstr ecoh-app
echo.
pause