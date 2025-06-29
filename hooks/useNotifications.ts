import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface NotificationData {
  type: 'actividad_asignada' | 'estado_cambiado' | 'actividad_comentario' | 'actividad_vencida';
  actividadId: number;
  mensaje: string;
  usuarioOrigen?: {
    id: number;
    nombre: string;
    email: string;
  };
  usuarioDestino?: {
    id: number;
    nombre: string;
    email: string;
  };
  actividad?: {
    id: number;
    tipoActividad: string;
    causa: string;
    ruc: string;
  };
  estadoAnterior?: string;
  estadoNuevo?: string;
  timestamp: string;
}

export function useNotifications() {
  const { user, isLoaded } = useUser();
  const [userDbId, setUserDbId] = useState<string | null>(null);

  // Obtener el ID de base de datos del usuario
  useEffect(() => {
    const fetchUserDbId = async () => {
      if (!isLoaded || !user) return;

      try {
        console.log('🔔 Obteniendo ID de usuario para notificaciones...');
        const response = await fetch('/api/usuarios/me');
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔔 Usuario obtenido:', userData.nombre, 'ID:', userData.id);
          setUserDbId(userData.id?.toString());
        } else {
          console.error('🔔 Error obteniendo usuario:', response.status, response.statusText);
          const errorData = await response.json().catch(() => null);
          console.error('🔔 Detalle del error:', errorData);
        }
      } catch (error) {
        console.error('🔔 Error de red obteniendo usuario:', error);
      }
    };

    fetchUserDbId();
  }, [user, isLoaded]);

  useEffect(() => {
    if (!userDbId || !isLoaded || !user) {
      console.log('🔔 No se puede conectar SSE:', { userDbId, isLoaded, hasUser: !!user });
      return;
    }

    console.log(`🔔 Conectando SSE para usuario ${userDbId}...`);

    // Crear conexión SSE
    const eventSource = new EventSource(`/api/notifications/stream?userId=${userDbId}`);

    eventSource.onopen = () => {
      console.log('🔔 ✅ Conexión SSE establecida');
    };

    eventSource.onmessage = (event) => {
      try {
        console.log('🔔 📨 Notificación recibida:', event.data);
        const notification: NotificationData = JSON.parse(event.data);
        handleNotification(notification);
      } catch (error) {
        console.error('🔔 ❌ Error parseando notificación:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('🔔 ❌ Error SSE:', error);
      console.log('🔔 🔄 Reconectando en 5 segundos...');
      setTimeout(() => {
        eventSource.close();
      }, 5000);
    };

    return () => {
      console.log('🔔 🔌 Cerrando conexión SSE');
      eventSource.close();
    };
  }, [userDbId, isLoaded, user]);

  const handleNotification = useCallback((notification: NotificationData) => {
    console.log('🔔 🎯 Procesando notificación tipo:', notification.type);
    
    switch (notification.type) {
      case 'actividad_asignada':
        toast.success(notification.mensaje, {
          description: `RUC: ${notification.actividad?.ruc} - ${notification.actividad?.tipoActividad}`,
          action: {
            label: 'Ver actividad',
            onClick: () => {
              console.log('🔔 👆 Usuario hizo click en "Ver actividad"');
              window.location.reload();
            }
          },
          duration: 10000,
        });
        break;

      case 'estado_cambiado':
        toast.info(notification.mensaje, {
          description: `${notification.estadoAnterior} → ${notification.estadoNuevo}`,
          action: {
            label: 'Ver actividad',
            onClick: () => {
              console.log('🔔 👆 Usuario hizo click en "Ver actividad"');
              window.location.reload();
            }
          },
          duration: 8000,
        });
        break;

      case 'actividad_vencida':
        toast.error(notification.mensaje, {
          description: `RUC: ${notification.actividad?.ruc}`,
          action: {
            label: 'Ver actividad',
            onClick: () => {
              console.log('🔔 👆 Usuario hizo click en "Ver actividad"');
              window.location.reload();
            }
          },
          duration: 12000,
        });
        break;

      default:
        toast(notification.mensaje, {
          duration: 5000,
        });
    }
  }, []);
}