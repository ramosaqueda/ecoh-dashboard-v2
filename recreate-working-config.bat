@echo off
echo ========================================
echo    RECREAR CONFIGURACION ORIGINAL
echo ========================================
echo.

echo [INFO] Vamos a recrear la configuracion exacta que funcionaba antes
echo [INFO] Sin modificaciones, sin experimentos, solo lo basico
echo.

echo [INFO] Limpiando...
docker stop ecoh-app ecoh-app-test 2>nul
docker rm ecoh-app ecoh-app-test 2>nul

echo [INFO] Verificando que el puerto este libre...
netstat -ano | findstr :3000
if not errorlevel 1 (
    echo [WARNING] Puerto 3000 ocupado, pero continuando...
)

echo.
echo [INFO] METODO 1: Docker-compose (como estaba originalmente)
echo ========================================
echo.
echo Ejecutando: docker-compose up -d
docker-compose up -d

if not errorlevel 1 (
    echo [SUCCESS] Docker-compose ejecutado sin errores
    echo [INFO] Esperando 30 segundos para inicio completo...
    timeout /t 30 /nobreak >nul
    
    echo [INFO] Estado del contenedor:
    docker ps | findstr ecoh-app
    
    echo [INFO] Logs del inicio:
    docker logs ecoh-app --tail 15
    
    echo [INFO] Probando conexion HTTP...
    curl -f http://localhost:3000 2>nul
    if not errorlevel 1 (
        echo [SUCCESS] ¡FUNCIONA! La aplicacion responde en http://localhost:3000
        goto :success
    ) else (
        echo [WARNING] No responde aun, pero puede estar iniciando...
        echo [INFO] ¿Esperar 1 minuto más? ^(s/N^):
        set /p wait_more=
        if /i "!wait_more!"=="s" (
            timeout /t 60 /nobreak >nul
            curl -f http://localhost:3000 2>nul
            if not errorlevel 1 (
                echo [SUCCESS] ¡FUNCIONA! Tardó un poco más en iniciar
                goto :success
            )
        )
    )
) else (
    echo [ERROR] Docker-compose falló
)

echo.
echo [INFO] METODO 2: Contenedor directo con configuracion simple
echo ========================================
echo.
docker-compose down 2>nul

echo Creando contenedor directamente...
docker run -d --name ecoh-app ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  -e NODE_ENV=production ^
  -e DATABASE_URL=postgresql://postgres:r1101kcn@host.docker.internal:5432/sac?schema=public ^
  -v "%cd%\uploads:/app/public/uploads" ^
  -v "%cd%\logs:/app/logs" ^
  ecoh-dashboard:latest

echo [INFO] Esperando 30 segundos...
timeout /t 30 /nobreak >nul

echo [INFO] Logs:
docker logs ecoh-app --tail 15

curl -f http://localhost:3000 2>nul
if not errorlevel 1 (
    echo [SUCCESS] ¡FUNCIONA con configuracion directa!
    goto :success
)

echo.
echo [INFO] METODO 3: Imagen del 7 de agosto (más estable)
echo ========================================
echo.
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

docker run -d --name ecoh-app ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  ecoh-dashboard-app:latest

echo [INFO] Esperando 30 segundos...
timeout /t 30 /nobreak >nul

echo [INFO] Logs:
docker logs ecoh-app --tail 15

curl -f http://localhost:3000 2>nul
if not errorlevel 1 (
    echo [SUCCESS] ¡FUNCIONA con imagen antigua!
    goto :success
)

echo [ERROR] Ningún método funcionó
echo [INFO] Logs completos del último intento:
docker logs ecoh-app
goto :end

:success
echo.
echo ========================================
echo    ¡EXITO!
echo ========================================
echo.
echo ✅ Tu aplicación está funcionando
echo ✅ URL: http://localhost:3000
echo ✅ Contenedor: ecoh-app
echo ✅ Estado: Corriendo
echo.

:end
pause