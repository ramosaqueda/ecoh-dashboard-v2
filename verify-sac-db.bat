@echo off
echo ========================================
echo    VERIFICAR BASE DE DATOS SAC
echo ========================================
echo.

echo [INFO] Verificando si la base de datos SAC existe...
echo.

REM Intentar conectar y listar bases de datos
echo Ejecutando: psql -U postgres -h localhost -c "\l" ^| findstr sac
psql -U postgres -h localhost -c "\l" | findstr sac
if errorlevel 1 (
    echo.
    echo [ERROR] No se encontro la base de datos SAC
    echo.
    echo ¿Deseas crearla? ^(s/N^):
    set /p create_db=
    if /i "!create_db!"=="s" (
        echo [INFO] Creando base de datos SAC...
        psql -U postgres -h localhost -c "CREATE DATABASE sac;"
        if errorlevel 1 (
            echo [ERROR] Error al crear la base de datos
        ) else (
            echo [SUCCESS] Base de datos SAC creada
        )
    )
) else (
    echo [SUCCESS] Base de datos SAC encontrada
)

echo.
echo [INFO] Probando conexion a la base de datos SAC...
psql -U postgres -h localhost -d sac -c "SELECT current_database(), current_user, version();"
if errorlevel 1 (
    echo [ERROR] No se pudo conectar a la base de datos SAC
    echo.
    echo Posibles causas:
    echo 1. PostgreSQL no esta corriendo
    echo 2. Usuario postgres no tiene permisos
    echo 3. Base de datos SAC no existe
    echo 4. Puerto 5432 no disponible
    echo.
) else (
    echo [SUCCESS] Conexion a SAC exitosa
)

echo.
echo [INFO] Verificando tablas principales en SAC...
psql -U postgres -h localhost -d sac -c "\dt" 2>nul
if errorlevel 1 (
    echo [INFO] No se encontraron tablas o error de acceso
    echo ¿La base de datos SAC tiene las tablas necesarias?
) else (
    echo [SUCCESS] Tablas encontradas en SAC
)

echo.
echo [INFO] Probando conexion desde Docker (simulando el contenedor)...
docker run --rm postgres:13 psql -h host.docker.internal -U postgres -d sac -c "SELECT 'Docker connection OK';" 2>nul
if errorlevel 1 (
    echo [WARNING] Error conectando desde Docker
    echo Esto podria causar problemas en el contenedor
) else (
    echo [SUCCESS] Conexion desde Docker funcionando
)

echo.
pause