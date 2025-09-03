@echo off
echo ========================================
echo    RESTAURAR CON IMAGEN DE 3 SEMANAS
echo ========================================
echo.

echo [INFO] Usando imagen ecoh-dashboard-app:latest de hace 3 semanas
echo [INFO] Esta imagen es mas antigua y estable (11.9GB vs 6.74GB)
echo.

echo [INFO] Deteniendo contenedor problemático...
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

echo [INFO] Creando contenedor con imagen estable...
docker run -d --name ecoh-app ^
    -p 3000:3000 ^
    --restart unless-stopped ^
    ecoh-dashboard-app:latest

if errorlevel 1 (
    echo [ERROR] Error al crear contenedor
    pause
    exit /b 1
)

echo [SUCCESS] Contenedor creado con imagen de hace 3 semanas

echo [INFO] Esperando 30 segundos para inicio completo...
timeout /t 30 /nobreak >nul

echo [INFO] Verificando logs de inicio...
docker logs ecoh-app --tail 15

echo.
echo [INFO] Probando conexión...
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No responde aún en puerto 3000
    echo [INFO] Estado del contenedor:
    docker ps | findstr ecoh-app
    echo.
    echo [INFO] ¿Esperar 1 minuto más? ^(s/N^):
    set /p wait_more=
    if /i "!wait_more!"=="s" (
        timeout /t 60 /nobreak >nul
        curl -f http://localhost:3000 >nul 2>&1
        if errorlevel 1 (
            echo [INFO] Aún no responde, pero revisa: http://localhost:3000
        ) else (
            echo [SUCCESS] ¡FUNCIONANDO! http://localhost:3000
        )
    )
) else (
    echo [SUCCESS] ¡FUNCIONANDO! Accede en: http://localhost:3000
)

echo.
echo ========================================
echo    RESULTADO FINAL
echo ========================================
echo.
echo Contenedor: ecoh-app
echo Imagen: ecoh-dashboard-app:latest ^(3 semanas - estable^)
echo Puerto: 3000
echo URL: http://localhost:3000
echo.
echo Esta imagen es anterior al código problemático
echo y debería funcionar correctamente.
echo.
pause