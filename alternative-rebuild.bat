@echo off
echo ========================================
echo    METODOS ALTERNATIVOS DE RECONSTRUCCION
echo ========================================
echo.

echo [INFO] Si el metodo principal falla, prueba estas alternativas:
echo.

echo ----------------------------------------
echo METODO 1: Docker-compose basico
echo ----------------------------------------
echo docker-compose down
echo docker-compose build --no-cache
echo docker-compose up -d
echo docker logs ecoh-app

echo.
echo ----------------------------------------
echo METODO 2: Docker directo
echo ----------------------------------------
echo docker build -t ecoh-dashboard:latest .
echo docker run -d --name ecoh-app -p 3000:3000 --env-file .env ecoh-dashboard:latest
echo docker logs ecoh-app

echo.
echo ----------------------------------------  
echo METODO 3: Con red host (si hay problemas de red)
echo ----------------------------------------
echo docker build -t ecoh-dashboard:latest .
echo docker run -d --name ecoh-app --network host --env-file .env ecoh-dashboard:latest
echo docker logs ecoh-app

echo.
echo ----------------------------------------
echo METODO 4: Desde imagen de backup (si existe)
echo ----------------------------------------
echo docker images ^| findstr backup
echo docker run -d --name ecoh-app -p 3000:3000 ecoh-app-backup:latest
echo docker logs ecoh-app

echo.
echo ----------------------------------------
echo COMANDOS DE DIAGNOSTICO
echo ----------------------------------------
echo docker ps -a
echo docker logs ecoh-app --tail 50
echo docker inspect ecoh-app
echo netstat -ano ^| findstr :3000

echo.
echo ¿Cual metodo quieres probar? ^(1-4^):
set /p method=
echo.

if "%method%"=="1" (
    echo [INFO] Ejecutando metodo 1 - Docker-compose basico...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 20
)

if "%method%"=="2" (
    echo [INFO] Ejecutando metodo 2 - Docker directo...
    docker stop ecoh-app 2>nul
    docker rm ecoh-app 2>nul
    docker build -t ecoh-dashboard:latest .
    docker run -d --name ecoh-app -p 3000:3000 --env-file .env ecoh-dashboard:latest
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 20
)

if "%method%"=="3" (
    echo [INFO] Ejecutando metodo 3 - Red host...
    docker stop ecoh-app 2>nul
    docker rm ecoh-app 2>nul
    docker build -t ecoh-dashboard:latest .
    docker run -d --name ecoh-app --network host --env-file .env ecoh-dashboard:latest
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 20
)

if "%method%"=="4" (
    echo [INFO] Ejecutando metodo 4 - Desde backup...
    docker stop ecoh-app 2>nul
    docker rm ecoh-app 2>nul
    docker images | findstr backup
    docker run -d --name ecoh-app -p 3000:3000 ecoh-app-backup:latest
    timeout /t 15 /nobreak >nul
    docker logs ecoh-app --tail 20
)

echo.
echo Verificando resultado:
docker ps | findstr ecoh-app
echo.
pause