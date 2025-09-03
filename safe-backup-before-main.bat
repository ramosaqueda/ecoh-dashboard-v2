@echo off
echo ========================================
echo    VERIFICACION DE SEGURIDAD COMPLETA
echo ========================================
echo.

echo [1] ESTADO ACTUAL DEL REPOSITORIO:
echo ==================================
echo Rama actual:
git branch --show-current

echo.
echo Todas las ramas:
git branch -a

echo.
echo Estado de archivos:
git status

echo.
echo Commits recientes en rama actual:
git log --oneline -5

echo.
echo [2] VERIFICANDO SI HAY CAMBIOS SIN GUARDAR:
echo ==========================================
git diff --name-only
if errorlevel 1 (
    echo [INFO] No hay cambios sin guardar
) else (
    echo [WARNING] HAY CAMBIOS SIN GUARDAR - necesitan ser guardados
)

echo.
echo Archivos en staging:
git diff --cached --name-only

echo.
echo [3] VERIFICANDO RAMA MAIN:
echo =========================
echo Ultimo commit en main:
git log origin/main --oneline -1 2>nul
if errorlevel 1 (
    echo [WARNING] No se puede acceder a origin/main - puede ser que no este actualizada
    echo [INFO] Intentando ver main local...
    git log main --oneline -1 2>nul
)

echo.
echo [4] COMPARANDO RAMA ACTUAL VS MAIN:
echo ==================================
echo Diferencias entre rama actual y main:
git diff --name-only HEAD main 2>nul
if errorlevel 1 (
    echo [INFO] No se puede comparar - main puede no existir localmente
)

echo.
echo ========================================
echo    PLAN DE BACKUP SEGURO
echo ========================================
echo.
echo PASO 1: Crear backup de TODO el trabajo actual
echo PASO 2: Crear backup de imagenes Docker
echo PASO 3: Verificar que main esta disponible
echo PASO 4: Solo entonces proceder con el cambio
echo.

set /p proceed="¿Continuar con el plan de backup seguro? (s/N): "

if /i not "%proceed%"=="s" (
    echo [INFO] Operacion cancelada por seguridad
    pause
    exit /b 0
)

echo.
echo [BACKUP 1] CREANDO STASH DEL TRABAJO ACTUAL:
echo ============================================
git add -A
git stash push -m "BACKUP-COMPLETO-$(date /t)-$(time /t)" --include-untracked
echo [SUCCESS] Trabajo actual guardado en stash

echo.
echo [BACKUP 2] CREANDO BACKUP DE IMAGENES DOCKER:
echo ==============================================
echo Creando backup de imagen actual...
docker commit ecoh-app ecoh-backup-before-main:latest 2>nul
docker save ecoh-dashboard:latest -o ecoh-dashboard-backup.tar 2>nul
docker save ecoh-dashboard-app:latest -o ecoh-dashboard-app-backup.tar 2>nul
echo [SUCCESS] Backups Docker creados

echo.
echo [BACKUP 3] CREANDO RAMA DE BACKUP:
echo ==================================
git checkout -b backup-before-main-$(date /t | tr -d '/')
git stash pop
git add -A
git commit -m "Backup completo antes de volver a main"
echo [SUCCESS] Rama de backup creada con todos los cambios

echo.
echo [VERIFICACION] CONFIRMANDO QUE MAIN EXISTE:
echo ===========================================
git checkout main 2>nul
if errorlevel 1 (
    echo [ERROR] RAMA MAIN NO EXISTE O NO ES ACCESIBLE
    echo [INFO] Ramas disponibles:
    git branch -a
    echo.
    echo [CRITICAL] NO PROCEDER - main no esta disponible
    pause
    exit /b 1
) else (
    echo [SUCCESS] Rama main accesible
    echo [INFO] Ultimo commit en main:
    git log --oneline -1
)

echo.
echo ========================================
echo    BACKUP COMPLETADO - TODO SEGURO
echo ========================================
echo.
echo ✅ Trabajo actual guardado en: backup-before-main-[fecha]
echo ✅ Stash de seguridad creado
echo ✅ Imagenes Docker respaldadas (.tar files)
echo ✅ Rama main verificada y accesible
echo.
echo AHORA ES SEGURO PROCEDER CON LA RECONSTRUCCION
echo.
echo ¿Proceder con la reconstruccion desde main? (s/N): 
set /p final_proceed=

if /i "%final_proceed%"=="s" (
    echo [INFO] Procediendo con reconstruccion segura...
    call rebuild-from-main.bat
) else (
    echo [INFO] Reconstruccion pospuesta. Todos los backups estan listos.
    echo.
    echo Para restaurar tu trabajo:
    echo git checkout backup-before-main-[fecha]
)

echo.
pause