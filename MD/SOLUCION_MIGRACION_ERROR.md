# 🔧 Solución Error de Migración Prisma

## ❌ Error Encontrado
```
Migration `20250821000000_add_estado_causa` failed to apply cleanly to the shadow database.
```

## ✅ Soluciones (en orden de preferencia)

### **Solución 1: Reset de Migraciones (Recomendado para desarrollo)**

```bash
# 1. Reset completo de migraciones
npx prisma migrate reset

# 2. Confirmar cuando pregunte (escribir 'y')
# Esto eliminará la base de datos y la recreará

# 3. Aplicar todas las migraciones desde cero
npx prisma migrate dev --name add_notificaciones_table

# 4. Generar cliente
npx prisma generate
```

### **Solución 2: Forzar Push sin Migraciones**

```bash
# 1. Push directo del schema (saltándose migraciones)
npx prisma db push

# 2. Generar cliente
npx prisma generate

# 3. (Opcional) Reiniciar migraciones desde estado actual
npx prisma migrate dev --create-only --name init_from_current_state
npx prisma migrate resolve --applied init_from_current_state
```

### **Solución 3: Limpiar Shadow Database**

```bash
# 1. Eliminar shadow database manualmente
# En PostgreSQL:
# DROP DATABASE IF EXISTS "ecohDesa08_shadow";

# 2. Intentar migración nuevamente
npx prisma migrate dev --name add_notificaciones_table
```

### **Solución 4: Migración Manual + Prisma Resolve**

Si las anteriores no funcionan:

```sql
-- 1. Conectar a tu base de datos y ejecutar manualmente:
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,
  tipo VARCHAR(50) NOT NULL DEFAULT 'info',
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  actividad_id INTEGER,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_lectura TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_notificacion_usuario 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_actividad 
    FOREIGN KEY (actividad_id) REFERENCES "Actividad"(id) ON DELETE SET NULL,
    
  -- Check constraint para tipo
  CONSTRAINT chk_notificacion_tipo 
    CHECK (tipo IN ('info', 'warning', 'success', 'error'))
);

-- Crear índices
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion DESC);
CREATE INDEX idx_notificaciones_usuario_leida ON notificaciones(usuario_id, leida) WHERE leida = FALSE;
```

```bash
# 2. Después de la migración manual:
npx prisma db pull
npx prisma generate
```

## 🎯 **Solución Recomendada para tu caso:**

Dado que estás en desarrollo, te recomiendo la **Solución 1**:

```bash
npx prisma migrate reset
# Escribir 'y' cuando pregunte
npx prisma migrate dev --name init_with_notificaciones
npx prisma generate
```

## ⚠️ **Importante:**
- `migrate reset` **eliminará todos los datos** de la base de datos
- Si tienes datos importantes, haz backup primero
- Para producción, usa las soluciones 2 o 4

## 🧪 **Verificar que funcionó:**

```bash
# 1. Verificar estado
npx prisma migrate status

# 2. Ver tablas en Prisma Studio
npx prisma studio

# 3. Probar conexión
# Reiniciar servidor y probar la campanita
```

---

**¿Cuál solución prefieres intentar primero?**