// /components/notifications/NotificationChecker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationChecker() {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const processedNotifications = useRef(new Set<string>()); // 🔧 Rastrear notificaciones ya procesadas

  useEffect(() => {
    if (!user?.id) return;

     

    const checkForNotifications = async () => {
      try {
        // Hacer una petición simple para buscar notificaciones pendientes
        const response = await fetch(`/api/actividades/notify/check?userId=${user.id}`, {
          method: 'GET'
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.notifications && data.notifications.length > 0) {
            console.log(`🔔 ${data.notifications.length} notificaciones encontradas para ${user.firstName}`);
            
            // 🔧 Filtrar solo notificaciones nuevas (no procesadas)
            const newNotifications = data.notifications.filter((notification: any) => {
              const notificationKey = `${notification.actividadId}-${notification.type}`;
              if (processedNotifications.current.has(notificationKey)) {
                return false; // Ya procesada, omitir
              }
              processedNotifications.current.add(notificationKey); // Marcar como procesada
              return true; // Nueva, procesar
            });
            
            if (newNotifications.length > 0) {
              console.log(`✅ ${newNotifications.length} notificaciones NUEVAS (filtradas)`);
              
              newNotifications.forEach((notification: any) => {
                addNotification({
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                  actividadId: notification.actividadId,
                  causaRuc: notification.causaRuc,
                  tipoActividad: notification.tipoActividad,
                  actionUrl: notification.actionUrl,
                  priority: notification.priority || 'medio' // ✅ Agregar priority requerida
                });
                
                console.log(`📬 Notificación agregada: ${notification.title} (ID: ${notification.actividadId})`);
              });
            } else {
              console.log(`⏭️ Todas las notificaciones ya fueron procesadas`);
            }
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check inicial después de 2 segundos
    const initialTimeout = setTimeout(checkForNotifications, 2000);

    // Check cada 10 segundos
    const intervalId = setInterval(checkForNotifications, 10000);

    console.log(`🔔 Iniciado checker de notificaciones para ${user.firstName || user.emailAddresses[0]?.emailAddress}`);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      // 🔧 Limpiar el Set cuando el componente se desmonta
      processedNotifications.current.clear();
      console.log('🔔 Detenido checker de notificaciones');
    };
  }, [user?.id, addNotification]);

  return null; // Este componente no renderiza nada
}
