@echo off
echo ========================================
echo    CREAR CONTENEDOR DESDE IMAGEN EXISTENTE
echo ========================================
echo.

echo [INFO] Usando imagen: ecoh-dashboard:latest (creada 2025-09-01)
echo [INFO] Puerto: 3000 (libre)
echo.

echo [INFO] Paso 1: Verificando archivo .env...
if not exist ".env" (
    echo [ERROR] Archivo .env no encontrado
    pause
    exit /b 1
)

echo [INFO] Variables de entorno actuales:
type .env
echo.

echo [INFO] Paso 2: Creando contenedor con docker-compose...
docker-compose up -d
if errorlevel 1 (
    echo [WARNING] docker-compose fallo, probando metodo directo...
    
    echo [INFO] Creando contenedor directamente...
    docker run -d --name ecoh-app ^
      -p 3000:3000 ^
      --restart unless-stopped ^
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
      -e NEXT_TELEMETRY_DISABLED=1 ^
      -v "%cd%\uploads:/app/public/uploads" ^
      -v "%cd%\logs:/app/logs" ^
      ecoh-dashboard:latest
    
    if errorlevel 1 (
        echo [ERROR] Error al crear contenedor
        pause
        exit /b 1
    )
)

echo [SUCCESS] Contenedor creado

echo [INFO] Esperando 20 segundos para inicio completo...
timeout /t 20 /nobreak >nul

echo [INFO] Verificando estado...
docker ps | findstr ecoh-app
if errorlevel 1 (
    echo [ERROR] Contenedor no esta corriendo
    echo [INFO] Logs del contenedor:
    docker logs ecoh-app --tail 30
) else (
    echo [SUCCESS] Contenedor ecoh-app corriendo
)

echo [INFO] Probando conexion HTTP...
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No responde en puerto 3000
    echo [INFO] Logs recientes:
    docker logs ecoh-app --tail 15
    
    echo [INFO] ¿Probar con conexion localhost en lugar de host.docker.internal? ^(s/N^):
    set /p try_localhost=
    if /i "!try_localhost!"=="s" (
        echo [INFO] Recreando con localhost...
        docker stop ecoh-app
        docker rm ecoh-app
        
        docker run -d --name ecoh-app ^
          --network host ^
          -e NODE_ENV=production ^
          -e DATABASE_URL=postgresql://postgres:r1101kcn@localhost:5432/sac?schema=public ^
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
          -e NEXT_TELEMETRY_DISABLED=1 ^
          -v "%cd%\uploads:/app/public/uploads" ^
          -v "%cd%\logs:/app/logs" ^
          ecoh-dashboard:latest
        
        timeout /t 15 /nobreak >nul
        docker ps | findstr ecoh-app
        docker logs ecoh-app --tail 10
    )
) else (
    echo [SUCCESS] ¡Aplicacion funcionando en http://localhost:3000!
)

echo.
echo ========================================
echo    RESULTADO
echo ========================================
echo.
echo Contenedor: ecoh-app
echo Estado: $(docker ps --format "{{.Status}}" --filter "name=ecoh-app")
echo Puerto: 3000
echo URL: http://localhost:3000
echo.
echo Para ver logs: docker logs ecoh-app
echo Para detener: docker stop ecoh-app
echo.
pause