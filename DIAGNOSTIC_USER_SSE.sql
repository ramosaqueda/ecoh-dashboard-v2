-- Script de Diagnóstico y Solución - Usuario SSE
-- ================================================

-- PASO 1: Verificar si tu usuario existe en la base de datos
-- Reemplaza 'TU_CLERK_USER_ID' con el ID que te muestra el diagnóstico
-- Ejemplo: 'user_2xyz123abc456'

SELECT 
    id,
    clerk_id,
    email,
    nombre,
    rol,
    "createdAt"
FROM "Usuario"
WHERE clerk_id = 'TU_CLERK_USER_ID';

-- Si el query anterior NO devuelve resultados, tu usuario no existe en la BD
-- Continúa con el PASO 2

-- ================================================
-- PASO 2: Listar todos los usuarios existentes
-- ================================================

SELECT 
    id,
    clerk_id,
    email,
    nombre,
    rol,
    "createdAt"
FROM "Usuario"
ORDER BY "createdAt" DESC;

-- ================================================
-- PASO 3: Si tu usuario NO existe, créalo
-- ================================================

-- OPCIÓN A: Crear usuario con rol ADMIN
-- Reemplaza los valores entre comillas simples con tu información real

INSERT INTO "Usuario" (
    clerk_id,
    email,
    nombre,
    rol,
    "createdAt",
    "updatedAt"
) VALUES (
    'TU_CLERK_USER_ID',           -- Ejemplo: 'user_2xyz123abc456'
    'tu_email@ejemplo.com',        -- Tu email de Clerk
    'Tu Nombre',                   -- Tu nombre completo
    'ADMIN',                       -- Opciones: 'ADMIN', 'ANALYST', 'AUDITOR'
    NOW(),
    NOW()
);

-- ================================================
-- PASO 4: Verificar que el usuario se creó correctamente
-- ================================================

SELECT 
    id,
    clerk_id,
    email,
    nombre,
    rol,
    "createdAt"
FROM "Usuario"
WHERE clerk_id = 'TU_CLERK_USER_ID';

-- ================================================
-- PASO 5: Si ya existe pero tiene un clerk_id diferente, actualizarlo
-- ================================================

-- Primero, encuentra tu usuario por email
SELECT 
    id,
    clerk_id,
    email,
    nombre
FROM "Usuario"
WHERE email = 'tu_email@ejemplo.com';

-- Si existe con un clerk_id diferente, actualizarlo:
UPDATE "Usuario"
SET 
    clerk_id = 'TU_NUEVO_CLERK_USER_ID',
    "updatedAt" = NOW()
WHERE email = 'tu_email@ejemplo.com';

-- ================================================
-- PASO 6: Verificación Final
-- ================================================

-- Este query debe devolver tu usuario con el clerk_id correcto
SELECT 
    id,
    clerk_id,
    email,
    nombre,
    rol,
    "createdAt",
    "updatedAt"
FROM "Usuario"
WHERE clerk_id = 'TU_CLERK_USER_ID';

-- ================================================
-- INFORMACIÓN ADICIONAL
-- ================================================

-- Roles disponibles:
-- - ADMIN: Acceso completo al sistema
-- - ANALYST: Puede ver y editar causas/actividades
-- - AUDITOR: Solo lectura

-- Después de crear/actualizar el usuario:
-- 1. Refresca la página en el navegador
-- 2. Haz clic en "Ejecutar Diagnóstico Completo" en el panel SSE
-- 3. Si todo está correcto, haz clic en "Reconectar SSE"

-- ================================================
-- TROUBLESHOOTING
-- ================================================

-- Si después de crear el usuario SSE sigue sin conectar:

-- 1. Verifica que el servidor Next.js está corriendo:
--    npm run dev

-- 2. Verifica las variables de entorno en .env:
--    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
--    CLERK_SECRET_KEY=sk_test_...
--    DATABASE_URL=postgresql://...

-- 3. Reinicia el servidor Next.js después de crear el usuario

-- 4. Limpia el caché del navegador y vuelve a cargar la página

-- 5. Revisa los logs del servidor para ver si hay errores al conectar SSE
