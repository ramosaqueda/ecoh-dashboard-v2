@echo off
echo ========================================
echo    DIAGNOSTICAR ERRORES 500 EN ECOH-APP
echo ========================================
echo.

echo [1] LOGS DEL CONTENEDOR (ultimas 50 lineas):
echo =====================================
docker logs ecoh-app --tail 50

echo.
echo [2] LOGS EN TIEMPO REAL (Ctrl+C para parar):
echo ==========================================
echo [INFO] Abriendo logs en tiempo real. Navega en el sistema para generar errores...
echo [INFO] Presiona Ctrl+C cuando tengas suficientes logs
echo.
timeout /t 3 /nobreak >nul
start cmd /k "docker logs -f ecoh-app"

echo.
echo [3] VERIFICAR CONEXION A BASE DE DATOS DESDE CONTENEDOR:
echo ====================================================
docker exec ecoh-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Probando conexion BD...');
prisma.\$connect()
  .then(() => {
    console.log('✅ BD: Conexion exitosa');
    return prisma.causa.count();
  })
  .then(count => {
    console.log('✅ BD: Total causas:', count);
  })
  .catch(err => {
    console.log('❌ BD Error:', err.message);
    console.log('❌ BD Code:', err.code);
  })
  .finally(() => prisma.\$disconnect());
" 2>&1

echo.
echo [4] VERIFICAR VARIABLES DE ENTORNO CRITICAS:
echo ==========================================
echo DATABASE_URL:
docker exec ecoh-app printenv DATABASE_URL

echo.
echo NODE_ENV:
docker exec ecoh-app printenv NODE_ENV

echo.
echo [5] PROBAR ENDPOINTS ESPECIFICOS:
echo ===============================

echo.
echo Probando /api/health:
curl -s -w "Status: %%{http_code}\n" http://localhost:3000/api/health

echo.
echo Probando /api/causas (simple):
curl -s -w "Status: %%{http_code}\n" "http://localhost:3000/api/causas?limit=1" | head -5

echo.
echo Probando endpoint que falla (analytics):
curl -s -w "Status: %%{http_code}\n" "http://localhost:3000/api/analytics/delitos-distribution?onlyEcoh=false&year=2025" | head -5

echo.
echo [6] INFORMACION DEL CONTENEDOR:
echo =============================
echo Imagen utilizada:
docker inspect ecoh-app --format="{{.Config.Image}}"

echo.
echo Fecha de creacion de la imagen:
docker inspect ecoh-dashboard-app:latest --format="{{.Created}}"

echo.
echo ========================================
echo    ANALISIS COMPLETADO
echo ========================================
echo.
echo Revisa los logs arriba para identificar:
echo - Errores de Prisma/BD
echo - Errores de endpoints especificos  
echo - Variables de entorno faltantes
echo - Problemas de codigo/schema
echo.
pause