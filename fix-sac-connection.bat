@echo off
echo ========================================
echo    SOLUCION PROBLEMAS BD SAC
echo ========================================
echo.

echo [1] Verificando/Creando base de datos SAC...
psql -U postgres -h localhost -c "SELECT 1 FROM pg_database WHERE datname='sac';" 2>nul | findstr "1" >nul
if errorlevel 1 (
    echo [INFO] Base de datos SAC no existe, creandola...
    psql -U postgres -h localhost -c "CREATE DATABASE sac;"
    if errorlevel 1 (
        echo [ERROR] No se pudo crear la BD SAC
        pause
        exit /b 1
    )
    echo [SUCCESS] Base de datos SAC creada
) else (
    echo [SUCCESS] Base de datos SAC ya existe
)

echo.
echo [2] Verificando permisos del usuario postgres en SAC...
psql -U postgres -h localhost -d sac -c "SELECT current_user, current_database();"
if errorlevel 1 (
    echo [ERROR] Usuario postgres no puede acceder a SAC
    pause
    exit /b 1
)

echo.
echo [3] Probando conexion con la URL exacta que usa Docker...
echo URL: postgresql://postgres:r1101kcn@host.docker.internal:5432/sac?schema=public
echo.

REM Crear archivo temporal para probar conexion
echo import { PrismaClient } from '@prisma/client'; > test-connection.js
echo. >> test-connection.js
echo const prisma = new PrismaClient({ >> test-connection.js
echo   datasources: { >> test-connection.js
echo     db: { >> test-connection.js
echo       url: 'postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public' >> test-connection.js
echo     } >> test-connection.js
echo   } >> test-connection.js
echo }); >> test-connection.js
echo. >> test-connection.js
echo async function testConnection() { >> test-connection.js
echo   try { >> test-connection.js
echo     await prisma.$connect(); >> test-connection.js
echo     console.log('✅ Conexion a SAC exitosa'); >> test-connection.js
echo     const result = await prisma.$queryRaw`SELECT current_database(), count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'`; >> test-connection.js
echo     console.log('📊 Info de BD:', result); >> test-connection.js
echo   } catch (error) { >> test-connection.js
echo     console.error('❌ Error de conexion:', error.message); >> test-connection.js
echo   } finally { >> test-connection.js
echo     await prisma.$disconnect(); >> test-connection.js
echo   } >> test-connection.js
echo } >> test-connection.js
echo. >> test-connection.js
echo testConnection(); >> test-connection.js

echo [INFO] Probando conexion con Prisma...
node test-connection.js
set connection_test_result=%errorlevel%

echo.
echo [4] Limpiando archivo temporal...
del test-connection.js 2>nul

if %connection_test_result% neq 0 (
    echo.
    echo [ERROR] La conexion fallo
    echo.
    echo PASOS MANUALES PARA SOLUCION:
    echo.
    echo 1. Verificar PostgreSQL: 
    echo    net start postgresql-x64-13
    echo.
    echo 2. Conectar manualmente y verificar SAC:
    echo    psql -U postgres -h localhost
    echo    \l (listar bases de datos)
    echo    \c sac (conectar a SAC)
    echo    \dt (ver tablas)
    echo.
    echo 3. Si SAC no tiene tablas, ejecutar migraciones:
    echo    npx prisma migrate deploy
    echo    npx prisma db push
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Conexion a SAC verificada correctamente
echo.
echo Ahora puedes ejecutar: restart-with-sac.bat
echo.
pause