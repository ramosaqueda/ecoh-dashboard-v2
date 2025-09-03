@echo off
echo ========================================
echo    RECONSTRUIR CON MIGRACIONES
echo ========================================
echo.

echo [INFO] Aplicando migraciones antes de construir contenedor...
echo.

echo [1] Configurando variables de entorno para SAC...
set DATABASE_URL=postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public

echo [2] Aplicando migraciones de Prisma...
npx prisma migrate deploy
if errorlevel 1 (
    echo [WARNING] migrate deploy fallo, probando db push...
    npx prisma db push --accept-data-loss
)

echo [3] Generando cliente de Prisma...
npx prisma generate

echo [4] Verificando que las tablas se crearon...
psql -U postgres -h localhost -d sac -c "SELECT count(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'public';"

echo.
echo [5] Deteniendo contenedor actual...
docker stop ecoh-app-v2-test 2>nul
docker rm ecoh-app-v2-test 2>nul

echo [6] Reconstruyendo imagen con migraciones aplicadas...
docker build -f Dockerfile.new -t ecoh-dashboard:latest .
if errorlevel 1 (
    echo [WARNING] Construccion completa fallo, usando simple...
    docker build -f Dockerfile.simple -t ecoh-dashboard:latest .
)

echo [7] Creando contenedor final con SAC...
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

echo.
echo [SUCCESS] Contenedor reconstruido con migraciones
echo.
echo Esperando 20 segundos para inicio completo...
timeout /t 20 /nobreak >nul

echo [INFO] Verificando logs...
docker logs ecoh-app-v2-test --tail 15

echo.
echo Probar en: http://localhost:3001
echo.
echo Si funciona, ejecutar: switch-containers.bat
echo Si no funciona, ejecutar: restore-original.bat
echo.
pause