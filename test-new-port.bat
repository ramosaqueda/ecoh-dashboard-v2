@echo off
echo ========================================
echo    SOLUCION RAPIDA - CAMBIO DE PUERTOS
echo ========================================
echo.

echo [INFO] Deteniendo contenedor nuevo temporal...
docker stop ecoh-app-v2 2>nul
docker rm ecoh-app-v2 2>nul

echo [INFO] Creando contenedor nuevo en puerto 3001...
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
  -v %cd%\uploads:/app/public/uploads ^
  -v %cd%\logs:/app/logs ^
  --network bridge ^
  ecoh-dashboard:latest

if errorlevel 1 (
    echo [ERROR] Error al crear el contenedor
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Contenedor nuevo creado en puerto 3001
echo.
echo Para probar el nuevo sistema:
echo http://localhost:3001
echo.
echo Para ver logs:
echo docker logs ecoh-app-v2-test
echo.
echo Si funciona correctamente, ejecuta switch-containers.bat
echo.
pause