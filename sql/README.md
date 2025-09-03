# 📋 Scripts SQL - Estado de Causa

Este directorio contiene los scripts SQL para implementar la funcionalidad de **Estados de Causa** en el sistema ECOH.

## 📁 Archivos Incluidos

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `migrate_estado_causa.sql` | Script principal de migración | Implementar la funcionalidad |
| `rollback_estado_causa.sql` | Script de rollback | Revertir cambios (emergencia) |
| `verify_estado_causa.sql` | Script de verificación | Validar implementación |

## 🚀 Instrucciones de Uso

### **1. Desarrollo Local**

```bash
# Opción A: Usando psql directamente
psql -h localhost -U tu_usuario -d tu_base_datos -f sql/migrate_estado_causa.sql

# Opción B: Usando herramienta de tu preferencia (pgAdmin, DBeaver, etc.)
# Simplemente abre y ejecuta el contenido del archivo
```

### **2. Producción**

```bash
# 1. Hacer backup antes de ejecutar
pg_dump -h tu_host -U tu_usuario -d tu_base_datos > backup_antes_estados_$(date +%Y%m%d_%H%M%S).sql

# 2. Ejecutar migración
psql -h tu_host_prod -U tu_usuario_prod -d tu_base_datos_prod -f sql/migrate_estado_causa.sql

# 3. Verificar resultado
psql -h tu_host_prod -U tu_usuario_prod -d tu_base_datos_prod -f sql/verify_estado_causa.sql
```

### **3. Verificación Post-Implementación**

```bash
# Ejecutar script de verificación
psql -h tu_host -U tu_usuario -d tu_base_datos -f sql/verify_estado_causa.sql
```

## 🎯 Estados de Causa Implementados

| ID | Nombre | Código | Descripción | Color |
|----|--------|--------|-------------|-------|
| 1 | En Tramitación | `TRAMITACION` | Causa en proceso de investigación activa | 🔵 Azul |
| 2 | Investigación Cerrada | `INV_CERRADA` | Causa con investigación cerrada sin sentencia | 🟡 Ámbar |
| 3 | Cerrada con Sentencia | `CERRADA_SENTENCIA` | Causa cerrada con sentencia definitiva | 🟢 Verde |

## ✅ Cambios Realizados

### **Estructura de Base de Datos**

1. **Nueva tabla**: `estados_causa`
   - Campos: id, nombre, descripcion, codigo, activo, orden, color, createdAt, updatedAt
   - Índices únicos en: nombre, codigo
   - Trigger automático para updatedAt

2. **Tabla Causa modificada**:
   - Nueva columna: `estadoCausaId` (INTEGER, nullable)
   - Nuevo índice: `idx_causa_estado_causa`
   - Nueva foreign key: `Causa_estadoCausaId_fkey`

### **Funcionalidades**

- ✅ Gestión CRUD completa de estados
- ✅ Relación opcional entre Causa y Estado
- ✅ API endpoints: `/api/estados-causa`
- ✅ Componente selector en formularios
- ✅ Validaciones de integridad referencial

## 🔧 Solución de Problemas

### **Error: "relation estados_causa does not exist"**

```bash
# Verificar que el script se ejecutó correctamente
psql -c "SELECT COUNT(*) FROM estados_causa;" tu_base_datos

# Si la tabla no existe, re-ejecutar el script de migración
psql -f sql/migrate_estado_causa.sql tu_base_datos
```

### **Error: "column estadoCausaId does not exist"**

```bash
# Verificar la columna
psql -c "\\d \"Causa\"" tu_base_datos

# Si no existe, re-ejecutar migración
psql -f sql/migrate_estado_causa.sql tu_base_datos
```

### **Rollback Completo (Emergencia)**

```bash
# ⚠️ CUIDADO: Esto eliminará toda la funcionalidad
psql -f sql/rollback_estado_causa.sql tu_base_datos
```

## 📊 Consultas Útiles

### **Ver distribución de causas por estado**

```sql
SELECT 
    COALESCE(ec.nombre, 'Sin Estado') as estado,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM "Causa" c
LEFT JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
GROUP BY ec.nombre, ec.orden
ORDER BY ec.orden NULLS LAST;
```

### **Buscar causas por estado**

```sql
SELECT 
    c.id,
    c."denominacionCausa",
    c.ruc,
    ec.nombre as estado
FROM "Causa" c
JOIN "estados_causa" ec ON c."estadoCausaId" = ec.id
WHERE ec.codigo = 'TRAMITACION'  -- o 'INV_CERRADA', 'CERRADA_SENTENCIA'
ORDER BY c.id DESC;
```

### **Asignar estado a causas sin estado**

```sql
-- Ejemplo: Asignar "En Tramitación" a causas sin estado
UPDATE "Causa" 
SET "estadoCausaId" = (SELECT id FROM "estados_causa" WHERE codigo = 'TRAMITACION')
WHERE "estadoCausaId" IS NULL;
```

## 🔄 Sincronización con Prisma

Después de ejecutar los scripts SQL, actualizar Prisma:

```bash
# 1. Introspección para sincronizar schema
npx prisma db pull

# 2. Generar cliente actualizado
npx prisma generate

# 3. (Opcional) Crear migración para tracking
npx prisma migrate dev --create-only --name add_estado_causa
```

## 📝 Notas Importantes

- ✅ **Los scripts son idempotentes**: Se pueden ejecutar múltiples veces sin problemas
- ✅ **No afectan datos existentes**: Las causas existentes mantendrán `estadoCausaId = NULL`
- ✅ **Backwards compatible**: El sistema funciona con o sin estados asignados
- ✅ **Producción ready**: Incluye todas las validaciones y controles necesarios

## 🆘 Soporte

Si encuentras problemas:

1. Ejecuta el script de verificación: `sql/verify_estado_causa.sql`
2. Revisa los logs de PostgreSQL
3. Verifica permisos de usuario de base de datos
4. En caso de emergencia, usa el script de rollback

---

**Fecha de creación**: 2025-01-15  
**Versión**: 1.0  
**Autor**: Sistema ECOH
