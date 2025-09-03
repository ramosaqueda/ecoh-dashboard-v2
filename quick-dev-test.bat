@echo off
echo ========================================
echo    SOLUCION RAPIDA - DESARROLLO
echo ========================================
echo.

echo [INFO] Configurando para desarrollo con BD SAC...
copy ".env.development" ".env" >nul

echo [INFO] Resolviendo migracion fallida (marcar como aplicada)...
npx prisma migrate resolve --applied "20250821000000_add_estado_causa"

echo [INFO] Aplicando migraciones restantes...
npx prisma migrate deploy

echo [INFO] Regenerando cliente...
npx prisma generate

echo.
echo [INFO] Probando conexion rapida...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.causa.count().then(count => {
  console.log('✅ Conexion OK - Causas:', count);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"

if errorlevel 1 (
    echo [ERROR] Aun hay problemas de conexion
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Todo listo para desarrollo
echo.
echo Ejecutando yarn dev...
yarn dev