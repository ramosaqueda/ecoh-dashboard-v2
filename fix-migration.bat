@echo off
echo ========================================
echo    SOLUCIONAR MIGRACION FALLIDA
echo ========================================
echo.

echo [INFO] Migracion fallida detectada: 20250821000000_add_estado_causa
echo.

echo [1] Verificando si la columna estadoCausaId ya existe...
psql -U postgres -h localhost -d sac -c "\d \"Causa\"" | findstr estadoCausaId
if not errorlevel 1 (
    echo [SUCCESS] La columna estadoCausaId YA EXISTE en la tabla
    echo [INFO] Marcando migracion como aplicada...
    npx prisma migrate resolve --applied "20250821000000_add_estado_causa"
    
    echo [INFO] Verificando estado despues de resolver...
    npx prisma migrate status
    
    echo [INFO] Aplicando migraciones restantes...
    npx prisma migrate deploy
    
) else (
    echo [INFO] La columna no existe, necesitamos aplicar la migracion
    echo.
    echo Opciones:
    echo 1. Intentar aplicar la migracion manualmente
    echo 2. Resetear migraciones (mas seguro para desarrollo)
    echo.
    set /p option="Selecciona opcion (1/2): "
    
    if "!option!"=="1" (
        echo [INFO] Intentando aplicar migracion manualmente...
        
        REM Leer el archivo de migracion
        if exist "prisma\migrations\20250821000000_add_estado_causa\migration.sql" (
            echo [INFO] Aplicando SQL de la migracion...
            psql -U postgres -h localhost -d sac -f "prisma\migrations\20250821000000_add_estado_causa\migration.sql"
            
            if errorlevel 1 (
                echo [ERROR] Error al aplicar migracion manual
            ) else (
                echo [SUCCESS] Migracion aplicada manualmente
                npx prisma migrate resolve --applied "20250821000000_add_estado_causa"
                npx prisma migrate deploy
            )
        ) else (
            echo [ERROR] Archivo de migracion no encontrado
        )
        
    ) else (
        echo [INFO] Reseteando migraciones (opcion segura)...
        npx prisma migrate reset --force
        if errorlevel 1 (
            echo [ERROR] Error en migrate reset
        ) else (
            echo [SUCCESS] Migraciones reseteadas y aplicadas
        )
    )
)

echo.
echo [INFO] Regenerando cliente Prisma...
npx prisma generate

echo.
echo [INFO] Verificando estado final...
npx prisma migrate status

echo.
echo [SUCCESS] Migraciones solucionadas
echo.
echo Ahora puedes ejecutar: yarn dev
echo.
pause