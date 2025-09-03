@echo off
echo ========================================
echo    REINICIAR CON BASE DE DATOS SAC
echo ========================================
echo.

echo [INFO] Deteniendo contenedor actual de prueba...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul

echo [INFO] Creando contenedor con base de datos SAC...
docker run -d --name ecoh-app-v2-test ^
  -p 3001:3000 ^
  -e NODE_ENV=production ^
  -e DATABASE_URL=postgresql://postgres:r1101kcn@host.docker.internal:5432/sac?schema=public ^
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
  --network bridge ^
  ecoh-dashboard:latest

if errorlevel 1 (
    echo [ERROR] Error al crear el contenedor
    echo.
    echo Verificando que:
    echo 1. La base de datos SAC este creada
    echo 2. El usuario postgres tenga acceso a la BD SAC
    echo 3. La BD este corriendo en el puerto 5432
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Contenedor creado con base de datos SAC
echo.
echo Esperando 15 segundos para que inicie completamente...
timeout /t 15 /nobreak >nul

echo [INFO] Verificando conexion a la base de datos...
docker logs ecoh-app-v2-test 2>&1 | findstr /C:"error" /C:"Error" /C:"ERROR"
if not errorlevel 1 (
    echo.
    echo [WARNING] Se encontraron errores en los logs:
    echo.
    docker logs ecoh-app-v2-test
    echo.
    echo [INFO] Posibles soluciones:
    echo 1. Verificar que la BD SAC exista: psql -U postgres -h localhost -c "\l"
    echo 2. Probar conexion manual: psql -U postgres -h localhost -d sac
    echo 3. Verificar permisos del usuario postgres en la BD SAC
    echo.
) else (
    echo [SUCCESS] No se detectaron errores evidentes
)

echo.
echo Para probar la aplicacion:
echo http://localhost:3001
echo.
echo Para ver logs completos:
echo docker logs ecoh-app-v2-test
echo.
echo Para ver solo errores:
echo docker logs ecoh-app-v2-test 2>&1 ^| findstr /i error
echo.
pause