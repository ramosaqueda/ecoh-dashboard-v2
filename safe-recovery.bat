@echo off
echo ========================================
echo    RECUPERACION SIMPLE Y SEGURA
echo ========================================
echo.

echo [INFO] Esta es la opción más segura y simple
echo [INFO] Usaremos la imagen del 7 de agosto que probablemente funcionaba bien
echo.

echo [INFO] Limpiando todo...
docker stop ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul
docker rm ecoh-app ecoh-app-v2 ecoh-app-v2-test ecoh-app-new 2>nul

echo [INFO] Creando contenedor con imagen estable del 7 de agosto...
docker run -d --name ecoh-app ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  ecoh-dashboard-app:latest

echo [SUCCESS] Contenedor creado

echo [INFO] Esperando 30 segundos para inicio completo...
timeout /t 30 /nobreak >nul

echo [INFO] Estado del contenedor:
docker ps | findstr ecoh-app

echo [INFO] Logs del inicio:
docker logs ecoh-app --tail 15

echo.
echo ========================================
echo    RESULTADO
echo ========================================
echo.
echo Si ves "Ready" o "started server" en los logs de arriba:
echo ✅ Accede a: http://localhost:3000
echo.
echo Si no funciona:
echo ❌ Ejecuta: docker logs ecoh-app
echo ❌ Y envíame los logs para ayudarte
echo.
echo Este es tu sistema más estable disponible.
echo.
pause