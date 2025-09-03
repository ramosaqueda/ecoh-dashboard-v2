@echo off
echo ========================================
echo    CREAR CONTENEDOR FUNCIONAL
echo ========================================
echo.

echo [INFO] Problema identificado: Configuracion del contenedor, NO la imagen
echo [INFO] Vamos a probar diferentes configuraciones hasta encontrar la correcta
echo.

echo [INFO] PASO 1: Limpiando contenedores existentes...
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

echo [INFO] PASO 2: Probando configuracion BASICA (sin variables complejas)...
echo.
echo Creando contenedor con configuracion minima...
docker run -d --name ecoh-app-test ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  ecoh-dashboard:latest

echo [INFO] Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app-test --tail 10

echo.
echo [INFO] ¿El contenedor arranco correctamente? (s/N):
set /p basic_works=
if /i "!basic_works!"=="s" (
    echo [SUCCESS] Configuracion basica funciona
    docker rename ecoh-app-test ecoh-app
    echo [SUCCESS] Contenedor renombrado a ecoh-app
    goto :end
)

echo [INFO] PASO 3: Probando con variables de entorno del .env...
docker stop ecoh-app-test 2>nul
docker rm ecoh-app-test 2>nul

echo Creando contenedor con archivo .env...
docker run -d --name ecoh-app-test ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  --env-file .env ^
  ecoh-dashboard:latest

echo [INFO] Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app-test --tail 10

echo.
echo [INFO] ¿Funciona con el archivo .env? (s/N):
set /p env_works=
if /i "!env_works!"=="s" (
    echo [SUCCESS] Configuracion con .env funciona
    docker rename ecoh-app-test ecoh-app
    echo [SUCCESS] Contenedor renombrado a ecoh-app
    goto :end
)

echo [INFO] PASO 4: Probando con docker-compose...
docker stop ecoh-app-test 2>nul
docker rm ecoh-app-test 2>nul

echo Usando docker-compose...
docker-compose up -d

echo [INFO] Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app --tail 10

echo.
echo [INFO] ¿Funciona con docker-compose? (s/N):
set /p compose_works=
if /i "!compose_works!"=="s" (
    echo [SUCCESS] Docker-compose funciona
    goto :end
)

echo [INFO] PASO 5: Probando imagen alternativa (del 7 de agosto)...
docker-compose down 2>nul
docker stop ecoh-app 2>nul
docker rm ecoh-app 2>nul

echo Probando imagen más antigua...
docker run -d --name ecoh-app ^
  -p 3000:3000 ^
  --restart unless-stopped ^
  ecoh-dashboard-app:latest

echo [INFO] Esperando 20 segundos...
timeout /t 20 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app --tail 10

echo.
echo [INFO] ¿Funciona la imagen del 7 de agosto? (s/N):
set /p old_works=
if /i "!old_works!"=="s" (
    echo [SUCCESS] Imagen antigua funciona
    goto :end
)

echo [ERROR] Ninguna configuracion funciono
echo [INFO] Necesitamos ver los logs detallados para diagnosticar
echo.
echo Mostrando logs completos de la ultima prueba:
docker logs ecoh-app --tail 50
goto :end

:end
echo.
echo ========================================
echo    RESULTADO FINAL
echo ========================================
echo.
echo Contenedor: ecoh-app
echo Estado: 
docker ps --format "{{.Status}}" --filter "name=ecoh-app"
echo.
echo Probar en: http://localhost:3000
echo Ver logs: docker logs ecoh-app
echo.
pause