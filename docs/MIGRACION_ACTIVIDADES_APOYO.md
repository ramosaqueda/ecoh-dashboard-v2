# Migración: Actividades de Apoyo Externo

## 📋 Resumen

Esta migración permite crear actividades que **no están asociadas a una causa específica**, conocidas como "Actividades de Apoyo Externo". Son útiles para tareas genéricas o de apoyo que no pertenecen a un caso judicial concreto.

## 🎯 Cambios Implementados

### Base de Datos
- ✅ Campo `causa_id` ahora es **opcional (nullable)**
- ✅ Nuevo campo `esActividadApoyo` (boolean) para identificar actividades de apoyo
- ✅ Índice agregado en `esActividadApoyo` para mejor performance

### Formulario
- ✅ Switch "Actividad de Apoyo Externo" 
- ✅ Campo "Causa" solo visible cuando NO es actividad de apoyo
- ✅ Validación: Causa es obligatoria solo para actividades regulares

### API
- ✅ POST: Acepta actividades sin causa cuando `esActividadApoyo = true`
- ✅ PUT: Permite actualizar actividades y cambiar entre apoyo/regular
- ✅ GET: Incluye el nuevo campo en las respuestas
- ✅ Notificaciones adaptadas para actividades sin causa

## 🚀 Instrucciones de Implementación

### Paso 1: Ejecutar la Migración SQL

**Opción A: Usando pgAdmin o cliente PostgreSQL**
```sql
-- Copiar y ejecutar el contenido de:
-- E:\desa\ecoh\ecoh-dashboard\prisma\migrations\add_actividad_apoyo.sql
```

**Opción B: Usando psql en terminal**
```powershell
# Desde el directorio raíz del proyecto
psql -U postgres -d tu_base_de_datos -f prisma/migrations/add_actividad_apoyo.sql
```

### Paso 2: Generar el Cliente de Prisma

```powershell
npx prisma generate
```

### Paso 3: Verificar el Build

```powershell
npm run build
```

### Paso 4: Reiniciar el Servidor

```powershell
npm run dev
```

## 📦 Archivos Modificados

### Schema de Prisma
```
prisma/schema.prisma
```
- Modelo `Actividad` actualizado con `causa_id?` y `esActividadApoyo`

### Componentes Frontend
```
components/forms/actividad/ActividadForm.tsx
```
- Switch para "Actividad de Apoyo"
- Validación condicional de causa
- Campo causa condicional

### API Endpoints
```
app/api/actividades/route.ts
```
- POST: Manejo de actividades sin causa
- PUT: Actualización con soporte para actividades de apoyo
- Notificaciones adaptadas

### Scripts
```
prisma/migrations/add_actividad_apoyo.sql - Script SQL de migración
scripts/migrate_actividades_apoyo.ps1     - Script automatizado de migración
```

## ✅ Verificación Post-Migración

### 1. Verificar Estructura de BD

```sql
-- Verificar que la columna existe y es nullable
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'Actividad'
    AND column_name IN ('causa_id', 'esActividadApoyo');
```

**Resultado esperado:**
```
 column_name       | data_type | is_nullable | column_default 
-------------------+-----------+-------------+----------------
 causa_id          | integer   | YES         | 
 esActividadApoyo  | boolean   | NO          | false
```

### 2. Probar en la Aplicación

1. **Crear Actividad Regular** (con causa):
   - Abrir formulario de actividad
   - Dejar el switch "Actividad de Apoyo" desactivado
   - Seleccionar una causa
   - Guardar → Debe funcionar normalmente

2. **Crear Actividad de Apoyo** (sin causa):
   - Abrir formulario de actividad
   - Activar el switch "Actividad de Apoyo Externo"
   - Verificar que el campo "Causa" desaparece
   - Guardar → Debe funcionar sin errores

3. **Editar Actividad**:
   - Abrir una actividad existente
   - Cambiar el switch
   - Verificar que funciona correctamente

### 3. Verificar Datos

```sql
-- Ver actividades de apoyo
SELECT 
    id,
    "esActividadApoyo",
    causa_id,
    tipo_actividad_id,
    observacion
FROM "Actividad"
WHERE "esActividadApoyo" = true;

-- Ver actividades regulares
SELECT 
    id,
    "esActividadApoyo",
    causa_id,
    tipo_actividad_id,
    observacion
FROM "Actividad"
WHERE "esActividadApoyo" = false;
```

## 🔄 Rollback (Si es necesario)

Si necesitas revertir la migración:

```sql
-- 1. Eliminar actividades de apoyo existentes (CUIDADO: pérdida de datos)
DELETE FROM "Actividad" WHERE "esActividadApoyo" = true;

-- 2. Hacer causa_id NOT NULL nuevamente
UPDATE "Actividad" SET causa_id = 1 WHERE causa_id IS NULL; -- Asignar causa por defecto
ALTER TABLE "Actividad" ALTER COLUMN causa_id SET NOT NULL;

-- 3. Eliminar el campo esActividadApoyo
ALTER TABLE "Actividad" DROP COLUMN IF EXISTS "esActividadApoyo";

-- 4. Regenerar cliente Prisma con el schema anterior
-- (restaurar schema.prisma desde Git)
npx prisma generate
```

## 📖 Uso

### Crear Actividad de Apoyo

1. Click en "Nueva Actividad"
2. Activar switch "Actividad de Apoyo Externo"
3. Seleccionar tipo de actividad
4. Completar fechas y observaciones
5. Guardar

### Identificar Actividades de Apoyo

Las actividades de apoyo se pueden identificar por:
- No tienen RUC de causa en el listado
- Tienen el badge o indicador de "Apoyo Externo"
- Filtro específico (si se implementa)

## 🔍 Troubleshooting

### Error: "Debe seleccionar una causa"
- **Causa**: El switch de apoyo está desactivado
- **Solución**: Activar el switch o seleccionar una causa

### Error al build: "Type 'Int' is not assignable..."
- **Causa**: Cliente de Prisma no regenerado
- **Solución**: `npx prisma generate`

### Actividades sin causa aparecen con error
- **Causa**: El campo causa es null pero se espera un objeto
- **Solución**: Verificar que los componentes manejan `causa?.ruc`

## 📞 Soporte

Si encuentras problemas:
1. Verifica que ejecutaste todos los pasos
2. Revisa los logs de la consola del navegador
3. Verifica los logs del servidor
4. Confirma que la migración SQL se ejecutó correctamente

---

**Fecha de creación**: 2025-11-17
**Versión**: 1.0.0
