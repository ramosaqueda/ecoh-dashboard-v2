@echo off
echo ========================================
echo    VERIFICAR CONTENIDO BD SAC
echo ========================================
echo.

echo [INFO] Listando todas las tablas en SAC...
echo.
psql -U postgres -h localhost -d sac -c "\dt"

echo.
echo [INFO] Contando registros en tablas principales...
echo.

echo Tabla Causa:
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_causas FROM \"Causa\";" 2>nul
if errorlevel 1 echo [ERROR] Tabla Causa no existe o no es accesible

echo.
echo Tabla Actividad:
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_actividades FROM \"Actividad\";" 2>nul
if errorlevel 1 echo [ERROR] Tabla Actividad no existe o no es accesible

echo.
echo Tabla Usuario:
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_usuarios FROM \"Usuario\";" 2>nul
if errorlevel 1 echo [ERROR] Tabla Usuario no existe o no es accesible

echo.
echo Tabla TipoActividad:
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_tipos FROM \"TipoActividad\";" 2>nul
if errorlevel 1 echo [ERROR] Tabla TipoActividad no existe o no es accesible

echo.
echo [INFO] Verificando estructura de la tabla Actividad...
psql -U postgres -h localhost -d sac -c "\d \"Actividad\"" 2>nul

echo.
echo ========================================
echo    DIAGNOSTICO PRISMA
echo ========================================
echo.

echo [INFO] Verificando estado de Prisma...
set DATABASE_URL=postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public
npx prisma migrate status
if errorlevel 1 (
    echo [ERROR] Problema con migraciones de Prisma
) else (
    echo [SUCCESS] Migraciones de Prisma OK
)

echo.
pause