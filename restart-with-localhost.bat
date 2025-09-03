@echo off
echo ========================================
echo    REINICIAR CON LOCALHOST (ALTERNATIVA)
echo ========================================
echo.

echo [INFO] Esta version usa localhost en lugar de host.docker.internal
echo [INFO] Deteniendo contenedor actual...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul

echo [INFO] Creando contenedor con conexion localhost...
docker run -d --name ecoh-app-v2-test ^
  --network host ^
  -e NODE_ENV=production ^
  -e DATABASE_URL=postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public ^
  -e NEXT_PUBLIC_BASE_URL=http://172.17.100.49:3001 ^
  -e NEXT_PUBLIC_API_URL=http://172.17.100.49:3001 ^
  -e NEXT_PUBLIC_ECOHLINK=http://172.17.100.49:8082 ^
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dGlkeS1xdWV0emFsLTI5LmNsZXJrLmFjY291bnRzLmRldiQ ^
  -e CLERK_SECRET_KEY=sk_test_aeTU3vGMzpC7twekLljvKqdhVWfhkkHArJ5NlV5dJX ^
  -e NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in ^
  -e NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up ^
  -e NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard ^
  -e NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard ^
  -e NEXTAUTH_SECRET=ZDA4NzhkMmEtZjEwYS00NTVlLWI4OGMtMGViYTM1ZWNjMTAy ^
  -e NEXTAUTH_URL=http://172.17.100.49:3001 ^
  -e NEXT_TELEMETRY_DISABLED=1 ^
  -v "%cd%\uploads:/app/public/uploads" ^
  -v "%cd%\logs:/app/logs" ^
  ecoh-dashboard:latest

if errorlevel 1 (
    echo [ERROR] Error al crear el contenedor con localhost
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Contenedor creado con conexion localhost
echo [INFO] Usando --network host para acceso directo a localhost
echo.
echo Esperando 15 segundos para que inicie...
timeout /t 15 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app-v2-test --tail 10

echo.
echo Probar en: http://localhost:3001
echo.
pause