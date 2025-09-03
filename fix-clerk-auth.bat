@echo off
echo ========================================
echo    SOLUCION PROBLEMAS CLERK
echo ========================================
echo.

echo [INFO] Los errores 500 son por problemas de autenticacion Clerk:
echo - Missing secretKey
echo - clerkMiddleware not detected
echo.

echo [INFO] Necesitamos agregar las variables de entorno de Clerk al contenedor
echo.

echo SOLUCION 1: Agregar variables de entorno de Clerk
echo ===============================================

echo [INFO] Deteniendo contenedor actual...
docker stop ecoh-app

echo [INFO] Creando contenedor con variables de entorno de Clerk...
echo.
echo IMPORTANTE: Necesitamos las claves de Clerk de tu archivo .env
echo.
echo ¿Tienes acceso al archivo .env local para copiar las claves de Clerk? ^(s/N^):
set /p has_env=

if /i "%has_env%"=="s" (
    echo.
    echo [INFO] Busca en tu archivo .env las siguientes variables:
    echo - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
    echo - CLERK_SECRET_KEY=sk_...
    echo.
    echo Pegue la CLERK_SECRET_KEY ^(sk_...^):
    set /p clerk_secret=
    echo.
    echo Pegue la NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ^(pk_...^):
    set /p clerk_public=
    
    echo [INFO] Creando contenedor con claves de Clerk...
    docker run -d --name ecoh-app ^
        -p 3000:3000 ^
        --restart unless-stopped ^
        -e CLERK_SECRET_KEY=!clerk_secret! ^
        -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=!clerk_public! ^
        -e NODE_ENV=production ^
        ecoh-dashboard-app:latest
    
    timeout /t 20 /nobreak >nul
    echo [SUCCESS] Contenedor creado con claves Clerk
    
) else (
    echo.
    echo SOLUCION ALTERNATIVA: Deshabilitar Clerk temporalmente
    echo ================================================
    echo.
    echo Si no tienes las claves, podemos crear una version sin autenticacion
    echo para que puedas acceder al sistema temporalmente.
    echo.
    echo ¿Crear contenedor sin autenticacion Clerk? ^(s/N^):
    set /p disable_clerk=
    
    if /i "!disable_clerk!"=="s" (
        echo [INFO] Creando contenedor con Clerk deshabilitado...
        docker run -d --name ecoh-app ^
            -p 3000:3000 ^
            --restart unless-stopped ^
            -e CLERK_SECRET_KEY=sk_test_disabled ^
            -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_disabled ^
            -e NODE_ENV=development ^
            ecoh-dashboard-app:latest
    )
)

echo.
echo [INFO] Esperando inicio de la aplicacion...
timeout /t 30 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app --tail 10

echo.
echo [INFO] Probando acceso...
curl -I http://localhost:3000 2>nul
if errorlevel 1 (
    echo [INFO] Aun no responde, pero deberia funcionar pronto
) else (
    echo [SUCCESS] Aplicacion respondiendo en http://localhost:3000
)

echo.
echo ========================================
echo    RESULTADO
echo ========================================
echo.
echo Si agregaste las claves correctas:
echo ✅ Deberia funcionar completamente
echo.
echo Si usaste la solucion temporal:
echo ⚠️  Funcionara pero sin autenticacion
echo ⚠️  Solo para pruebas, no para produccion
echo.
pause