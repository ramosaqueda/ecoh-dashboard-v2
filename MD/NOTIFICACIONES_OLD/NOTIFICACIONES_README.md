# Sistema de Notificaciones en Tiempo Real

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de notificaciones en tiempo real que incluye:

- ✅ **APIs RESTful** para gestión de notificaciones
- ✅ **Integración automática** con el sistema de actividades
- ✅ **Centro de notificaciones** en el header
- ✅ **Toast notifications** para nuevas notificaciones
- ✅ **Sonido de alerta** configurable
- ✅ **Polling en tiempo real** (30 segundos)
- ✅ **Base de datos** con tabla `notificaciones`

## 🗃️ Estructura de Archivos Creados

### APIs
```
app/api/notificaciones/
├── route.ts                  # GET/POST notificaciones
├── [id]/route.ts            # PUT/DELETE individual
└── bulk/route.ts            # Acciones masivas
```

### Hooks y Contextos
```
hooks/notifications/
├── useNotificacionesTiempoReal.ts
└── index.ts

contexts/
├── NotificationContext.tsx
└── index.ts
```

### Componentes
```
components/
├── NotificacionesHeader.tsx    # Centro de notificaciones (actualizado)
└── TestNotifications.tsx      # Componente de prueba
```

### Utilidades y Tipos
```
lib/notifications.ts          # Funciones helper
types/notification.ts         # Interfaces TypeScript
```

## ⚡ Funcionalidades Principales

### 1. **Notificaciones Automáticas**
Se crean automáticamente cuando:
- Se asigna una actividad a otro usuario
- Se reasigna una actividad existente
- Se actualiza el estado de una actividad

### 2. **Centro de Notificaciones**
- Badge con contador de no leídas
- Lista paginada con scroll
- Marcar como leída/eliminar individual
- Acciones masivas
- Refresh manual

### 3. **Toast + Sonido**
- Toast automático para nuevas notificaciones
- Sonido de alerta (`/public/sounds/notification.mp3`)
- Configuración de volumen y habilitación

### 4. **Tiempo Real**
- Polling cada 30 segundos
- Detección de nuevas notificaciones
- Actualización automática del estado

## 🚀 Integración Completada

### En el Layout
```typescript
// app/dashboard/date-range-provider-wrapper.tsx
<DateRangeProvider>
  <NotificationProvider>  {/* ✅ Agregado */}
    {children}
  </NotificationProvider>
</DateRangeProvider>
```

### En el Header
```typescript
// components/layout/header.tsx
<NotificacionesHeader />  {/* ✅ Ya existía, actualizado */}
```

### En la API de Actividades
```typescript
// app/api/actividades/route.ts
import { createActivityAssignmentNotification } from '@/lib/notifications';

// ✅ Notificación automática al crear actividad
if (finalUsuarioAsignadoId !== usuario.id) {
  await createActivityAssignmentNotification(
    finalUsuarioAsignadoId,
    actividad.id,
    actividad.tipoActividad.nombre,
    usuario.email
  );
}
```

## 🎯 Uso del Sistema

### 1. **Automático**
Las notificaciones se crean automáticamente cuando:
```typescript
// Al asignar una actividad
const nuevaActividad = await fetch('/api/actividades', {
  method: 'POST',
  body: JSON.stringify({
    // ... datos de la actividad
    usuarioAsignadoId: 'ID_DEL_USUARIO'  // ✅ Genera notificación
  })
});
```

### 2. **Manual (para pruebas)**
```typescript
// Crear notificación de prueba
const response = await fetch('/api/notificaciones', {
  method: 'POST',
  body: JSON.stringify({
    usuario_id: 1,
    titulo: 'Prueba',
    mensaje: 'Mensaje de prueba',
    tipo: 'info'
  })
});
```

### 3. **En Componentes**
```typescript
import { useNotificacionesTiempoReal } from '@/hooks/notifications';

function MiComponente() {
  const {
    notificaciones,
    notificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas
  } = useNotificacionesTiempoReal();

  return (
    <div>
      <Badge>{notificacionesNoLeidas}</Badge>
      {/* ... resto del componente */}
    </div>
  );
}
```

## 🔧 Configuración

### Sonido
El archivo de sonido está en `/public/sounds/notification.mp3` y se puede configurar:
```typescript
const { playNotificationSound, setVolume, setIsEnabled } = useNotificationSound();
```

### Polling
El intervalo de polling se puede ajustar en:
```typescript
// hooks/notifications/useNotificacionesTiempoReal.ts
intervalRef.current = setInterval(checkForNewNotifications, 30000); // 30 segundos
```

### Tipos de Notificación
```typescript
type TipoNotificacion = 'info' | 'warning' | 'success' | 'error';
```

## 🧪 Pruebas

1. **Componente de Prueba**: Usar `<TestNotifications />` en cualquier página
2. **Crear actividad**: Asignar a otro usuario debería generar notificación
3. **Verificar polling**: Las notificaciones aparecen automáticamente
4. **Sonido**: Debería reproducirse con cada nueva notificación

## 📝 Próximos Pasos Opcionales

1. **WebSockets**: Reemplazar polling por conexión en tiempo real
2. **Push Notifications**: Notificaciones del navegador
3. **Email notifications**: Notificaciones por correo
4. **Configuración de usuario**: Panel para configurar preferencias
5. **Notificaciones por categoria**: Filtros y configuración específica

## 🐛 Solución de Problemas

### Error de compilación
```bash
# Si hay errores de tipos, verificar imports:
import { NotificationProvider } from '@/contexts/NotificationContext';
```

### Sin sonido
```typescript
// Verificar que el archivo existe:
// public/sounds/notification.mp3
```

### No aparecen notificaciones
```typescript
// Verificar que el usuario esté logueado y el contexto esté disponible
const { notificaciones } = useNotificationContext();
```