@echo off
echo ========================================
echo    BACKUP BD SAC ANTES DE MIGRACIONES
echo ========================================
echo.

echo [INFO] Creando backup completo de la BD SAC...
set backup_file=sac_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.sql
set backup_file=%backup_file: =0%

echo [INFO] Archivo de backup: %backup_file%
pg_dump -U postgres -h localhost -d sac > %backup_file%
if errorlevel 1 (
    echo [ERROR] Error al crear backup
    pause
    exit /b 1
)

echo [SUCCESS] Backup creado: %backup_file%
echo.

echo [INFO] Verificando backup...
for %%A in ("%backup_file%") do (
    echo Tamaño del backup: %%~zA bytes
    if %%~zA LSS 1000 (
        echo [WARNING] Backup muy pequeño, podria estar vacio
        type "%backup_file%"
        pause
    ) else (
        echo [SUCCESS] Backup parece correcto
    )
)

echo.
echo [INFO] Para restaurar en caso de problemas:
echo psql -U postgres -h localhost -d sac ^< %backup_file%
echo.

echo ========================================
echo    APLICAR MIGRACIONES SEGURAS
echo ========================================
echo.

echo [INFO] Configurando DATABASE_URL para SAC...
set DATABASE_URL=postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public

echo [INFO] Verificando estado actual del esquema...
npx prisma db pull
if errorlevel 1 (
    echo [WARNING] No se pudo hacer pull del esquema actual
)

echo [INFO] Verificando diferencias entre esquema actual y codigo...
npx prisma migrate diff --from-local-d1 postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public --to-schema-datamodel prisma/schema.prisma --script
echo.

echo ¿Aplicar migraciones? Las diferencias se mostraron arriba ^(s/N^):
set /p apply_mig=
if /i "!apply_mig!"=="s" (
    echo [INFO] Aplicando migraciones...
    npx prisma migrate deploy
    if errorlevel 1 (
        echo [WARNING] Migrate deploy fallo, probando db push...
        echo.
        echo [WARNING] db push puede causar perdida de datos
        echo ¿Continuar con db push? ^(s/N^):
        set /p do_push=
        if /i "!do_push!"=="s" (
            npx prisma db push
        )
    )
    
    echo [INFO] Regenerando cliente de Prisma...
    npx prisma generate
    
    echo [SUCCESS] Migraciones aplicadas
) else (
    echo [INFO] Migraciones canceladas
)

echo.
echo Para restaurar si hay problemas:
echo psql -U postgres -h localhost -d sac ^< %backup_file%
echo.
pause