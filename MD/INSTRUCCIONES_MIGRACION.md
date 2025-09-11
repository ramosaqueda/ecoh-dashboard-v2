# 🔔 Instrucciones para Agregar Tabla de Notificaciones

## 1. **Crear y Ejecutar Migración**

```bash
# 1. Generar la migración
npx prisma migrate dev --name add_notificaciones_table

# 2. Generar el cliente de Prisma actualizado
npx prisma generate

# 3. (Opcional) Ver el estado de las migraciones
npx prisma migrate status
```

## 2. **Verificar que la Tabla se Creó**

Puedes verificar en tu base de datos que la tabla `notificaciones` se haya creado con:

```sql
-- Verificar que la tabla existe
\dt notificaciones

-- Ver la estructura de la tabla
\d notificaciones

-- Verificar índices
\di notificaciones*
```

## 3. **Si hay Problemas con la Migración**

### Opción A: Reset de Base de Datos (Solo Desarrollo)
```bash
# ⚠️ CUIDADO: Esto eliminará todos los datos
npx prisma migrate reset
```

### Opción B: Migración Manual
Si prefieres crear la tabla manualmente:

```sql
-- Crear tabla notificaciones
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

-- Luego ejecutar
npx prisma db pull
npx prisma generate
```

## 4. **Después de la Migración**

Una vez que la tabla esté creada, el sistema de notificaciones debería funcionar correctamente.

### Verificar Funcionamiento:
1. **Reiniciar el servidor** de desarrollo
2. **Abrir el navegador** y ir al dashboard
3. **Click en la campanita** - ya no debería dar error
4. **Crear una actividad** asignada a otro usuario
5. **Verificar** que aparezca la notificación

## 5. **Crear Notificación de Prueba**

Una vez que la tabla esté creada, puedes probar creando una notificación manualmente:

```sql
-- Insertar notificación de prueba (ajustar usuario_id según tu base de datos)
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, actividad_id)
VALUES (1, 'Notificación de prueba', 'Esta es una prueba del sistema de notificaciones', 'info', NULL);
```

## 6. **Troubleshooting**

### Error: "relation notificaciones does not exist"
```bash
# Verificar que Prisma esté sincronizado
npx prisma db push
npx prisma generate
```

### Error en TypeScript después de migración
```bash
# Reiniciar el servidor TypeScript
# En VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
# O reiniciar el servidor de desarrollo
```

### Error de permisos en base de datos
```sql
-- Dar permisos si es necesario
GRANT ALL PRIVILEGES ON TABLE notificaciones TO tu_usuario;
GRANT USAGE, SELECT ON SEQUENCE notificaciones_id_seq TO tu_usuario;
```

## 7. **Comandos de Verificación Post-Migración**

```bash
# 1. Verificar estado de Prisma
npx prisma studio

# 2. Verificar que el modelo existe
npx prisma validate

# 3. Ver todas las tablas
npx prisma db seed # si tienes seeds configurados
```

## 8. **Estado Esperado Después de la Migración**

✅ Tabla `notificaciones` creada
✅ Relaciones con `usuarios` y `Actividad` establecidas  
✅ Índices para performance creados
✅ Cliente Prisma actualizado
✅ API `/api/notificaciones` funcionando
✅ Centro de notificaciones sin errores
✅ Campanita funcional en el header

---

**🚀 Una vez completada la migración, el sistema de notificaciones estará completamente operativo.**