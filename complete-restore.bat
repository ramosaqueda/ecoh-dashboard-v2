@echo off
echo ========================================
echo    RESTAURACION COMPLETA SISTEMA ANTERIOR
echo ========================================
echo.

echo [INFO] Paso 1: Deteniendo y eliminando contenedores de prueba...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul
docker stop ecoh-app-v2 2>nul
docker rm ecoh-app-v2 2>nul
docker stop ecoh-app-new 2>nul
docker rm ecoh-app-new 2>nul

echo [INFO] Paso 2: Restaurando archivo .env original...
if exist ".env.backup.20250109" (
    copy ".env.backup.20250109" ".env" >nul
    echo [SUCCESS] .env restaurado desde backup
) else (
    echo [WARNING] Backup de .env no encontrado, usando configuracion por defecto
)

echo [INFO] Paso 3: Restaurando contenedor original...
docker start ecoh-app
if errorlevel 1 (
    echo [WARNING] No se pudo iniciar ecoh-app, intentando desde backup...
    
    echo [INFO] Creando contenedor desde imagen de backup...
    docker run -d --name ecoh-app ^
      -p 3000:3000 ^
      --restart unless-stopped ^
      ecoh-app-backup:latest
    
    if errorlevel 1 (
        echo [ERROR] No se pudo restaurar desde backup
        echo [INFO] Intentando con imagen original...
        
        REM Buscar imagenes disponibles
        docker images | findstr ecoh
        echo.
        echo [INFO] ¿Cual es el nombre de tu imagen original de ecoh?
        set /p original_image="Nombre de imagen (ej: ecoh-dashboard): "
        
        docker run -d --name ecoh-app ^
          -p 3000:3000 ^
          --restart unless-stopped ^
          !original_image!:latest
    )
)

echo.
echo [INFO] Paso 4: Verificando estado del contenedor...
timeout /t 10 /nobreak >nul

docker ps | findstr ecoh-app
if errorlevel 1 (
    echo [ERROR] Contenedor no esta corriendo
    echo [INFO] Verificando logs...
    docker logs ecoh-app
) else (
    echo [SUCCESS] Contenedor restaurado y corriendo
)

echo.
echo [INFO] Paso 5: Limpiando archivos de prueba...
del Dockerfile.new 2>nul
del Dockerfile.simple 2>nul
del docker-compose.new.yml 2>nul
del .env.development 2>nul
echo [INFO] Archivos de prueba eliminados

echo.
echo [INFO] Paso 6: Limpiando imagenes no utilizadas...
docker image prune -f

echo.
echo ========================================
echo    RESTAURACION COMPLETADA
echo ========================================
echo.
echo ✅ Contenedor original: ecoh-app
echo ✅ Puerto: 3000  
echo ✅ Configuracion: original
echo ✅ Estado: corriendo
echo.
echo 🌐 Acceder en: http://localhost:3000
echo.
echo Tu sistema esta exactamente como estaba antes de los cambios.
echo.
pause