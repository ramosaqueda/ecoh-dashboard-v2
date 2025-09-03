@echo off
echo ========================================
echo    RESTAURAR CONFIGURACION ORIGINAL
echo ========================================
echo.

echo [INFO] Buscando backup del .env...
for %%f in (.env.backup.*) do (
    echo Encontrado: %%f
    set latest_backup=%%f
)

if defined latest_backup (
    echo [INFO] Restaurando desde: %latest_backup%
    copy "%latest_backup%" ".env" >nul
    echo [SUCCESS] Configuracion original restaurada
) else (
    echo [WARNING] No se encontro backup del .env
    echo [INFO] Usando configuracion por defecto...
    
    echo # Variables originales > .env
    echo DB_USER=postgres >> .env
    echo DB_PASSWORD=r1101kcn >> .env
    echo DB_HOST=host.docker.internal >> .env
    echo DB_PORT=5432 >> .env
    echo DB_NAME=sac >> .env
    echo. >> .env
    echo NODE_ENV=production >> .env
    echo NEXT_TELEMETRY_DISABLED=1 >> .env
    
    echo [SUCCESS] Archivo .env recreado con configuracion basica
)

echo.
echo Configuracion actual:
type .env
echo.
pause