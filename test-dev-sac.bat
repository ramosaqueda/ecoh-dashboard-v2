@echo off
echo ========================================
echo    TEST DESARROLLO CON BD SAC
echo ========================================
echo.

echo [INFO] Creando backup del .env actual...
if exist ".env" (
    copy ".env" ".env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%" >nul
    echo [SUCCESS] Backup creado: .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
)

echo [INFO] Cambiando a configuracion de desarrollo...
copy ".env.development" ".env" >nul

echo [INFO] Aplicando migraciones a BD SAC (seguro)...
npx prisma migrate status
if errorlevel 1 (
    echo [INFO] Aplicando migraciones necesarias...
    npx prisma migrate deploy
)

echo [INFO] Generando cliente Prisma...
npx prisma generate

echo [INFO] Verificando conexion a BD SAC...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    const causaCount = await prisma.causa.count();
    const actividadCount = await prisma.actividad.count();
    const usuarioCount = await prisma.usuario.count();
    
    console.log('✅ Conexion exitosa a BD SAC');
    console.log('📊 Causas:', causaCount);
    console.log('📊 Actividades:', actividadCount);
    console.log('📊 Usuarios:', usuarioCount);
    
    if (causaCount === 0) {
      console.log('⚠️  BD SAC parece vacia - podrias necesitar importar datos');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
test();
"

if errorlevel 1 (
    echo [ERROR] Error de conexion a BD SAC
    echo [INFO] Restaurando .env original...
    copy ".env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%" ".env" >nul
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Todo configurado correctamente
echo.
echo INSTRUCCIONES:
echo.
echo 1. Ejecutar: yarn dev
echo 2. Abrir: http://localhost:3000
echo 3. Probar las funcionalidades
echo.
echo Para restaurar configuracion original:
echo copy ".env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%" ".env"
echo.
echo ¿Ejecutar yarn dev ahora? ^(s/N^):
set /p run_dev=
if /i "!run_dev!"=="s" (
    echo [INFO] Iniciando servidor de desarrollo...
    yarn dev
)

pause