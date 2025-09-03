@echo off
echo ========================================
echo    DIAGNOSTICO FUNDAMENTAL
echo ========================================
echo.

echo [1] ESTADO ACTUAL DE CONTENEDORES:
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [2] LOGS REALES DEL CONTENEDOR (ultimas 30 lineas):
docker logs ecoh-app --tail 30

echo.
echo [3] VERIFICANDO SI LA APP REALMENTE INICIA:
echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul
curl -I http://localhost:3000 2>nul
if errorlevel 1 (
    echo [ERROR] La aplicacion NO responde en puerto 3000
) else (
    echo [SUCCESS] La aplicacion SI responde en puerto 3000
)

echo.
echo [4] PROBANDO ENDPOINT BASICO:
curl -s http://localhost:3000/api/health 2>nul
if errorlevel 1 (
    echo [ERROR] Endpoint /api/health no responde
) else (
    echo [SUCCESS] Endpoint /api/health responde
)

echo.
echo [5] VERIFICANDO PROCESO DENTRO DEL CONTENEDOR:
docker exec ecoh-app ps aux 2>nul | findstr node
if errorlevel 1 (
    echo [ERROR] Proceso Node.js no encontrado en el contenedor
) else (
    echo [SUCCESS] Proceso Node.js corriendo en el contenedor
)

echo.
echo [6] VERIFICANDO VARIABLES DE ENTORNO EN EL CONTENEDOR:
docker exec ecoh-app printenv | findstr DATABASE_URL

echo.
echo [7] INTENTANDO CONECTAR A BD DESDE EL CONTENEDOR:
docker exec ecoh-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('BD: Conexion exitosa'))
  .catch(err => console.log('BD: Error -', err.message))
  .finally(() => prisma.\$disconnect());
" 2>nul

echo.
echo ========================================
echo    ANALISIS DE RESULTADOS
echo ========================================
pause