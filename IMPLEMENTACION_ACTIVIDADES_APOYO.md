# ✅ Resumen de Implementación: Actividades de Apoyo Externo

## 📦 Archivos Creados/Modificados

### ✅ Archivos Creados:
1. `prisma/migrations/add_actividad_apoyo.sql` - Script SQL de migración
2. `scripts/migrate_actividades_apoyo.ps1` - Script PowerShell automatizado
3. `docs/MIGRACION_ACTIVIDADES_APOYO.md` - Documentación completa

### ✅ Archivos Modificados:
1. `prisma/schema.prisma` - Modelo Actividad actualizado
2. `components/forms/actividad/ActividadForm.tsx` - Switch y validación de apoyo
3. `app/api/actividades/route.ts` - API actualizada (POST, PUT, notificaciones)
4. `app/dashboard/actividades/page.tsx` - Interfaces actualizadas
5. `app/api/dashboard/stats/route.ts` - Fix de tipado userId

## 🎯 Cambios Principales

### Base de Datos:
- ✅ `causa_id` es ahora **nullable**
- ✅ Nuevo campo `esActividadApoyo` (boolean, default false)
- ✅ Índice en `esActividadApoyo` para mejor performance

### Formulario (ActividadForm.tsx):
- ✅ Switch "Actividad de Apoyo Externo" con ícono Briefcase
- ✅ Campo "Causa" solo visible cuando NO es apoyo
- ✅ Validación: causaId obligatorio solo si NO es apoyo
- ✅ Validación: fechaTermino >= fechaInicio
- ✅ Validación: glosa_cierre obligatoria si estado = terminado

### API (actividades/route.ts):
- ✅ POST: Acepta actividades sin causa cuando esActividadApoyo = true
- ✅ PUT: Maneja cambio entre apoyo/regular correctamente
- ✅ Notificaciones adaptadas (mensaje diferente para apoyo)
- ✅ Metadata incluye esActividadApoyo

### Frontend (page.tsx):
- ✅ Interfaces actualizadas con causa opcional
- ✅ handleEdit maneja causa?.id correctamente
- ✅ Texto adaptado para actividades de apoyo

## 🚀 Pasos de Implementación

### Paso 1: Ejecutar Migración SQL
```sql
-- Ejecutar en pgAdmin o cliente PostgreSQL
-- Archivo: E:\desa\ecoh\ecoh-dashboard\prisma\migrations\add_actividad_apoyo.sql

-- O usar psql:
psql -U postgres -d tu_db -f prisma/migrations/add_actividad_apoyo.sql
```

### Paso 2: Generar Cliente Prisma
```powershell
cd E:\desa\ecoh\ecoh-dashboard
npx prisma generate
```

### Paso 3: Verificar Build
```powershell
npm run build
```

### Paso 4: Reiniciar Servidor
```powershell
npm run dev
```

## ✅ Verificación

### En la Base de Datos:
```sql
-- Verificar estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Actividad'
  AND column_name IN ('causa_id', 'esActividadApoyo');

-- Resultado esperado:
-- causa_id        | integer | YES | 
-- esActividadApoyo | boolean | NO  | false
```

### En la Aplicación:

1. **Crear Actividad Regular:**
   - Dejar switch "Actividad de Apoyo" desactivado
   - Campo "Causa" es visible y obligatorio
   - Seleccionar una causa
   - Guardar ✅

2. **Crear Actividad de Apoyo:**
   - Activar switch "Actividad de Apoyo Externo"
   - Campo "Causa" desaparece
   - Guardar sin causa ✅

3. **Editar Actividad:**
   - Abrir actividad existente
   - Cambiar switch de apoyo
   - Verificar que causa aparece/desaparece
   - Guardar ✅

### Queries de Verificación:
```sql
-- Ver actividades de apoyo
SELECT id, "esActividadApoyo", causa_id, tipo_actividad_id
FROM "Actividad"
WHERE "esActividadApoyo" = true;

-- Ver actividades con causa
SELECT id, "esActividadApoyo", causa_id, tipo_actividad_id
FROM "Actividad"
WHERE causa_id IS NOT NULL;
```

## 🎨 Interfaz de Usuario

### Formulario:
```
┌─────────────────────────────────────────────┐
│ Nueva Actividad / Editar Actividad          │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏢 Actividad de Apoyo Externo     ⚪→🔵 │ │
│ │ Marque para actividades genéricas        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Si NO es apoyo:]                           │
│ ┌─────────────────────────────────────────┐ │
│ │ Causa *                                  │ │
│ │ [Seleccionar causa...]                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Tipo de Actividad, fechas, etc...]        │
│                                             │
│                       [Guardar]  [Cancelar] │
└─────────────────────────────────────────────┘
```

## 🔄 Flujo de Validación

```
Usuario llena formulario
        ↓
¿Es Actividad de Apoyo?
    ↙         ↘
   SÍ         NO
    ↓          ↓
causaId     causaId
opcional    requerido
    ↓          ↓
esActividadApoyo = true/false
    ↓
POST /api/actividades
    ↓
BD: causa_id puede ser NULL si esActividadApoyo = true
```

## 📊 Impacto en Datos Existentes

### ⚠️ Actividades Existentes:
- ✅ NO se afectan
- ✅ Mantienen sus causas
- ✅ `esActividadApoyo` = false por defecto
- ✅ Siguen funcionando normalmente

### ✅ Compatibilidad:
- ✅ API sigue aceptando actividades con causa
- ✅ Formulario sigue validando causa cuando NO es apoyo
- ✅ Queries existentes siguen funcionando
- ✅ Notificaciones adaptadas

## 🎯 Casos de Uso

### Caso 1: Actividad Regular (CON causa)
```typescript
{
  causaId: "123",
  tipoActividadId: "5",
  esActividadApoyo: false,  // ← false
  fechaInicio: "2025-01-15",
  fechaTermino: "2025-01-20",
  estado: "inicio"
}
```
→ BD: `causa_id = 123`, `esActividadApoyo = false`

### Caso 2: Actividad de Apoyo (SIN causa)
```typescript
{
  causaId: undefined,  // ← sin causa
  tipoActividadId: "8",
  esActividadApoyo: true,  // ← true
  fechaInicio: "2025-01-15",
  fechaTermino: "2025-01-20",
  estado: "inicio"
}
```
→ BD: `causa_id = NULL`, `esActividadApoyo = true`

## 💡 Notas Importantes

1. **Causa es opcional SOLO si `esActividadApoyo = true`**
2. **La validación del formulario maneja ambos casos**
3. **Las notificaciones tienen mensajes diferentes**
4. **La tabla muestra badge "Apoyo" para actividades sin causa**
5. **Los filtros siguen funcionando (pueden filtrar por tipo)**

## 🐛 Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "Debe seleccionar una causa" | Switch apoyo desactivado | Activar switch o seleccionar causa |
| Build error: Type 'Int' is not assignable | Cliente Prisma no regenerado | `npx prisma generate` |
| Actividades sin causa con error | causa?.ruc no manejado | Verificar uso de optional chaining |
| Migración SQL falla | Constraint FK existente | Ejecutar script completo paso a paso |

## 📚 Referencias

- Documentación: `/docs/MIGRACION_ACTIVIDADES_APOYO.md`
- Script SQL: `/prisma/migrations/add_actividad_apoyo.sql`
- Script PowerShell: `/scripts/migrate_actividades_apoyo.ps1`

## ✅ Checklist Final

- [ ] Ejecutar migración SQL
- [ ] Generar cliente Prisma
- [ ] Verificar build exitoso
- [ ] Reiniciar servidor
- [ ] Crear actividad regular
- [ ] Crear actividad de apoyo
- [ ] Editar ambos tipos
- [ ] Verificar notificaciones
- [ ] Verificar listado
- [ ] Verificar filtros

---

**Estado**: ✅ Listo para implementar
**Fecha**: 2025-11-17
**Versión**: 1.0.0
