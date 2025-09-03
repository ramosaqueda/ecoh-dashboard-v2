@echo off
echo ========================================
echo    VERIFICAR DAÑOS Y RESTAURAR
echo ========================================
echo.

echo [INFO] Verificando TODOS los contenedores actuales...
echo.
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [INFO] ¿Cuál es el nombre del contenedor que se cerró accidentalmente?
set /p damaged_container="Nombre del contenedor cerrado: "

echo.
echo [INFO] Intentando reiniciar el contenedor cerrado...
docker start %damaged_container%
if errorlevel 1 (
    echo [ERROR] No se pudo reiniciar %damaged_container%
    echo [INFO] ¿El contenedor existe pero está detenido?
) else (
    echo [SUCCESS] Contenedor %damaged_container% reiniciado
)

echo.
echo [INFO] Estado actual de todos los contenedores:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [INFO] Si el contenedor no se pudo reiniciar automáticamente,
echo necesitaremos recrearlo. ¿Qué tipo de aplicación era?
echo ^(ej: base de datos, web app, etc.^)
echo.
pause