@echo off
echo ========================================
echo    DIAGNOSTICO COMPLETO BD SAC
echo ========================================
echo.

echo [1] Verificando servicio PostgreSQL...
sc query postgresql-x64-13 2>nul
if errorlevel 1 (
    echo [WARNING] Servicio PostgreSQL no encontrado con ese nombre
    echo Buscando otros servicios PostgreSQL...
    sc query | findstr /i postgres
) else (
    echo [SUCCESS] Servicio PostgreSQL encontrado
)

echo.
echo [2] Verificando puerto 5432...
netstat -ano | findstr :5432
if errorlevel 1 (
    echo [ERROR] Puerto 5432 no esta en uso - PostgreSQL podria no estar corriendo
) else (
    echo [SUCCESS] Puerto 5432 activo
)

echo.
echo [3] Verificando bases de datos disponibles...
echo Ejecutando: psql -U postgres -h localhost -l
psql -U postgres -h localhost -l
if errorlevel 1 (
    echo [ERROR] No se puede conectar a PostgreSQL como usuario postgres
    echo.
    echo Posibles causas:
    echo - PostgreSQL no esta corriendo
    echo - Usuario postgres no configurado
    echo - Autenticacion requerida
    echo.
    echo Intentando con usuario actual...
    psql -h localhost -l
)

echo.
echo [4] Intentando conexion especifica a SAC...
echo Ejecutando: psql -U postgres -h localhost -d sac -c "SELECT current_database();"
psql -U postgres -h localhost -d sac -c "SELECT current_database();"
if errorlevel 1 (
    echo [ERROR] No se puede conectar a la base de datos SAC
)

echo.
echo [5] Verificando variables de entorno del .env...
echo DATABASE_URL deberia ser:
echo postgresql://postgres:r1101kcn@host.docker.internal:5432/sac?schema=public
echo.

echo [6] Probando conexion desde Docker...
echo Ejecutando test de conexion desde contenedor...
docker run --rm postgres:13 psql postgresql://postgres:r1101kcn@host.docker.internal:5432/sac -c "SELECT 'Conexion exitosa desde Docker';" 2>nul
if errorlevel 1 (
    echo [ERROR] Docker no puede conectar a SAC
    echo.
    echo Probando conexion a localhost en lugar de host.docker.internal...
    docker run --rm --network host postgres:13 psql postgresql://postgres:r1101kcn@localhost:5432/sac -c "SELECT 'Conexion exitosa desde Docker con localhost';"
)

echo.
echo [7] Verificando logs del contenedor actual...
echo Ultimas 20 lineas de logs:
docker logs --tail 20 ecoh-app-v2-test 2>nul
if errorlevel 1 (
    echo [INFO] No hay contenedor ecoh-app-v2-test activo
)

echo.
echo ========================================
echo    RESUMEN DEL DIAGNOSTICO
echo ========================================
echo Si ves errores arriba, las causas mas comunes son:
echo.
echo 1. PostgreSQL no esta corriendo
echo 2. La BD SAC no existe
echo 3. Usuario postgres no tiene permisos en SAC
echo 4. host.docker.internal no resuelve correctamente
echo 5. Firewall bloqueando conexiones desde Docker
echo.
pause