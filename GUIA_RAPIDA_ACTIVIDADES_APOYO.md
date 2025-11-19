# ⚡ Guía Rápida: Implementar Actividades de Apoyo

## 🎯 ¿Qué hace esto?
Permite crear actividades **sin asociarlas a una causa específica** (actividades genéricas de apoyo).

## 🚀 Pasos de Implementación (5 minutos)

### 1️⃣ Ejecutar SQL (1 min)
```powershell
# Abrir pgAdmin y ejecutar:
E:\desa\ecoh\ecoh-dashboard\prisma\migrations\add_actividad_apoyo.sql
```

### 2️⃣ Regenerar Prisma (1 min)
```powershell
cd E:\desa\ecoh\ecoh-dashboard
npx prisma generate
```

### 3️⃣ Build (2 min)
```powershell
npm run build
```

### 4️⃣ Reiniciar (1 min)
```powershell
npm run dev
```

## ✅ Verificar que Funciona

1. Ir a **Gestión de Actividades** → Nueva Actividad
2. Verás un **switch** que dice "Actividad de Apoyo Externo"
3. **SIN activar** el switch: Campo "Causa" es visible y obligatorio ✅
4. **AL activar** el switch: Campo "Causa" desaparece ✅
5. Guardar sin causa cuando el switch está activado ✅

## 🎨 Lo que verás en el formulario

```
┌──────────────────────────────────────┐
│  🏢 Actividad de Apoyo Externo  [ ]  │ ← Switch
│                                      │
│  Causa *                             │ ← Solo visible si switch OFF
│  [Seleccionar causa...]              │
│                                      │
│  Tipo de Actividad *                 │
│  [Seleccionar tipo...]               │
│  ...                                 │
└──────────────────────────────────────┘
```

## 📝 Uso

### Actividad Regular (con causa):
- Dejar switch OFF
- Seleccionar causa
- Guardar normalmente

### Actividad de Apoyo (sin causa):
- Activar switch
- Campo causa desaparece
- Guardar sin causa

## 🔍 Verificar en BD

```sql
-- Ver que la migración funcionó
SELECT column_name, is_nullable 
FROM information_schema.columns
WHERE table_name = 'Actividad' 
  AND column_name IN ('causa_id', 'esActividadApoyo');

-- Ver actividades de apoyo creadas
SELECT id, "esActividadApoyo", causa_id 
FROM "Actividad" 
WHERE "esActividadApoyo" = true;
```

## 🐛 Si algo falla

| Problema | Solución |
|----------|----------|
| Build error | `npx prisma generate` |
| SQL error | Ejecutar línea por línea en pgAdmin |
| Switch no aparece | Reiniciar servidor |

## 📚 Más Info

- Documentación completa: `docs/MIGRACION_ACTIVIDADES_APOYO.md`
- Resumen detallado: `IMPLEMENTACION_ACTIVIDADES_APOYO.md`

---

**¡Listo! En 5 minutos tendrás actividades de apoyo funcionando 🎉**
