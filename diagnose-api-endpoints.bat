@echo off
echo ========================================
echo    DIAGNOSTICO API ENDPOINTS
echo ========================================
echo.

echo [INFO] Verificando logs del contenedor para errores de API...
docker logs ecoh-app --tail 50 | findstr /i "error\|prisma\|database\|500"

echo.
echo [INFO] Probando endpoints directamente...
echo.

echo Probando /api/health:
curl -s http://localhost:3000/api/health
echo.

echo Probando /api/causas:
curl -s http://localhost:3000/api/causas?count=true^&limit=1
echo.

echo [INFO] Verificando estructura de BD vs codigo...
echo Conectando a contenedor para verificar Prisma...
docker exec -it ecoh-app npx prisma db status 2>&1

echo.
echo [INFO] Verificando imagen y fecha de construccion...
docker inspect ecoh-dashboard:latest | findstr /i "created"

echo.
echo ========================================
echo    POSIBLES CAUSAS
echo ========================================
echo.
echo 1. La imagen tiene codigo mas nuevo que espera esquema BD diferente
echo 2. Prisma client desactualizado vs esquema de BD
echo 3. Variables de entorno incorrectas
echo 4. BD SAC no tiene estructura compatible con el codigo
echo.
pause