@echo off
echo ========================================
echo    VERIFICAR Y ARREGLAR PRISMA
echo ========================================
echo.

echo [1] Verificando tablas en la BD SAC...
echo.
psql -U postgres -h localhost -d sac -c "\dt"
if errorlevel 1 (
    echo [ERROR] No se puede acceder a SAC
    pause
    exit /b 1
)

echo.
echo [2] Contando tablas en SAC...
for /f %%i in ('psql -U postgres -h localhost -d sac -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"') do set table_count=%%i
echo Numero de tablas encontradas: %table_count%

if %table_count% LSS 10 (
    echo [WARNING] Pocas tablas encontradas. Es probable que necesites migrar el esquema.
    echo.
    echo ¿Deseas aplicar las migraciones de Prisma? ^(s/N^):
    set /p apply_migrations=
    if /i "!apply_migrations!"=="s" (
        echo [INFO] Aplicando migraciones de Prisma...
        npx prisma migrate deploy
        if errorlevel 1 (
            echo [WARNING] Migrate deploy fallo, probando db push...
            npx prisma db push
        )
        echo [INFO] Generando cliente de Prisma...
        npx prisma generate
    )
) else (
    echo [SUCCESS] BD SAC tiene suficientes tablas
)

echo.
echo [3] Verificando algunas tablas clave...
echo.
echo Tabla 'Causa':
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_causas FROM \"Causa\";" 2>nul
if errorlevel 1 (
    echo [ERROR] Tabla Causa no encontrada o error de acceso
)

echo.
echo Tabla 'Actividad':
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_actividades FROM \"Actividad\";" 2>nul
if errorlevel 1 (
    echo [ERROR] Tabla Actividad no encontrada o error de acceso
)

echo.
echo Tabla 'Usuario':
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_usuarios FROM \"Usuario\";" 2>nul
if errorlevel 1 (
    echo [ERROR] Tabla Usuario no encontrada o error de acceso
)

echo.
echo [4] Si las tablas existen pero estan vacias, ¿deseas importar datos?
echo.
set /p import_data="¿Tienes un backup SQL para importar? (s/N): "
if /i "!import_data!"=="s" (
    echo.
    echo Archivos SQL encontrados en el directorio:
    dir *.sql /b
    echo.
    set /p sql_file="Nombre del archivo SQL a importar: "
    if exist "!sql_file!" (
        echo [INFO] Importando !sql_file! a SAC...
        psql -U postgres -h localhost -d sac -f "!sql_file!"
        if errorlevel 1 (
            echo [ERROR] Error al importar datos
        ) else (
            echo [SUCCESS] Datos importados exitosamente
        )
    ) else (
        echo [ERROR] Archivo !sql_file! no encontrado
    )
)

echo.
echo ========================================
echo    RESUMEN
echo ========================================
echo.
echo Si aplicaste migraciones, reinicia el contenedor:
echo docker restart ecoh-app-v2-test
echo.
echo Luego prueba nuevamente: http://localhost:3001
echo.
pause