@echo off
echo ========================================
echo    INTERCAMBIAR CONTENEDORES
echo ========================================
echo.

echo [WARNING] Esto detendra el contenedor antiguo y activara el nuevo
set /p confirm="¿Continuar? (s/N): "
if /i not "%confirm%"=="s" (
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo [INFO] Deteniendo contenedor antiguo...
docker stop ecoh-app 2>nul

echo [INFO] Deteniendo contenedor de prueba...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul

echo [INFO] Creando nuevo contenedor en puerto 3000...
docker run -d --name ecoh-app-new ^
  -p 3000:3000 ^
  -e NODE_ENV=production ^
  -e DATABASE_URL=postgresql://postgres:r1101kcn@host.docker.internal:5432/sac?schema=public ^
  -e NEXT_PUBLIC_BASE_URL=http://172.17.100.49:3000 ^
  -e NEXT_PUBLIC_API_URL=http://172.17.100.49:3000 ^
  -e NEXT_PUBLIC_ECOHLINK=http://172.17.100.49:8082 ^
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dGlkeS1xdWV0emFsLTI5LmNsZXJrLmFjY291bnRzLmRldiQ ^
  -e CLERK_SECRET_KEY=sk_test_aeTU3vGMzpC7twekLljvKqdhVWfhkkHArJ5NlV5dJX ^
  -e NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in ^
  -e NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up ^
  -e NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard ^
  -e NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard ^
  -e NEXTAUTH_SECRET=ZDA4NzhkMmEtZjEwYS00NTVlLWI4OGMtMGViYTM1ZWNjMTAy ^
  -e NEXTAUTH_URL=http://172.17.100.49:3000 ^
  -v %cd%\uploads:/app/public/uploads ^
  -v %cd%\logs:/app/logs ^
  --network bridge ^
  ecoh-dashboard:latest

if errorlevel 1 (
    echo [ERROR] Error al crear el nuevo contenedor
    echo [INFO] Restaurando contenedor antiguo...
    docker start ecoh-app
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Nuevo contenedor activo en puerto 3000
echo.
echo Para finalizar completamente:
echo 1. Verificar que funciona: http://localhost:3000
echo 2. Si todo esta bien, ejecutar finalize-update.bat
echo.
pause