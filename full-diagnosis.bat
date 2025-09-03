@echo off
echo ========================================
echo    DIAGNOSTICO COMPLETO CONTENEDORES
echo ========================================
echo.

echo [1] CONTENEDORES ACTIVOS:
echo ================================
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}\t{{.Command}}"

echo.
echo [2] TODOS LOS CONTENEDORES (incluyendo detenidos):
echo ==================================================
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}\t{{.Command}}"

echo.
echo [3] IMAGENES DISPONIBLES:
echo =========================
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}"

echo.
echo [4] VERIFICANDO PUERTO 3000:
echo =============================
netstat -ano | findstr :3000
if errorlevel 1 (
    echo [INFO] Puerto 3000 libre
) else (
    echo [WARNING] Puerto 3000 ocupado
)

echo.
echo [5] INTENTANDO INICIAR ecoh-app:
echo ================================
docker start ecoh-app
if errorlevel 1 (
    echo [ERROR] No se pudo iniciar ecoh-app
    echo.
    echo [INFO] Verificando si el contenedor existe...
    docker ps -a | findstr ecoh-app
    if errorlevel 1 (
        echo [ERROR] Contenedor ecoh-app no encontrado
    ) else (
        echo [INFO] Contenedor encontrado, verificando logs...
        docker logs ecoh-app --tail 20
    )
) else (
    echo [SUCCESS] ecoh-app iniciado
    timeout /t 5 /nobreak >nul
    echo [INFO] Verificando estado...
    docker ps | findstr ecoh-app
)

echo.
echo [6] LOGS DEL CONTENEDOR (si existe):
echo ====================================
docker logs ecoh-app --tail 15 2>nul
if errorlevel 1 (
    echo [INFO] No hay logs disponibles o contenedor no existe
)

echo.
echo [7] VERIFICANDO IMAGENES DE BACKUP:
echo ===================================
docker images | findstr backup
if errorlevel 1 (
    echo [WARNING] No se encontraron imagenes de backup
) else (
    echo [SUCCESS] Imagenes de backup encontradas
)

echo.
echo ========================================
echo    RESUMEN DEL DIAGNOSTICO
echo ========================================
pause