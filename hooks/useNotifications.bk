// /hooks/useNotifications.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { Notification, NotificationState } from '@/lib/notifications/types';
import { notificationService } from '@/lib/notifications/notificationService';
import { eventManager } from '@/lib/notifications/eventManager';
import { audioManager } from '@/lib/notifications/audioManager';
import { notificationPolling } from '@/lib/notifications/notificationPolling';
import { toast } from 'sonner';

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isOpen: false
  });

  useEffect(() => {
    // Conectar al servicio de notificaciones
    notificationService.connect();

    // Configurar listeners
    const unsubscribeStateChange = eventManager.on('notifications:state-change', 
      (newState: NotificationState) => {
        setState(newState);
      }
    );

    const unsubscribeToast = eventManager.on('notification:toast', 
      (notification: Notification) => {
        // 🔧 SOLUCIÓN DRÁSTICA: Usar ID directamente como toast ID para deduplicación
        const toastKey = `actividad-${notification.actividadId}`;
        
        // Reproducir sonido solo una vez
        audioManager.playNotificationSound();
        
        // 🔧 Usar toast.custom() con ID específico para evitar duplicados
        toast(notification.title, {
          id: toastKey, // 🔑 CLAVE: Sonner usa este ID para deduplicar automáticamente
          description: notification.message,
          duration: Infinity,
          action: {
            label: 'Ver',
            onClick: () => {
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
            }
          },
          onDismiss: () => {
            notificationService.markAsRead(notification.id);
          }
        });
        
        console.log(`🎯 Toast creado con ID: ${toastKey} para: ${notification.title}`);
      }
    );

    // 🔔 INICIAR POLLING DE NOTIFICACIONES
    notificationPolling.start((notification: Notification) => {
      console.log('📬 Nueva notificación recibida vía polling:', notification.title);
      notificationService.addNotification(notification);
    });

    // Limpiar al desmontar
    return () => {
      unsubscribeStateChange();
      unsubscribeToast();
      notificationService.disconnect();
      notificationPolling.stop(); // 🔔 DETENER POLLING
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const dismissNotification = (notificationId: string) => {
    notificationService.dismissNotification(notificationId);
  };

  const dismissAll = () => {
    notificationService.dismissAll();
  };

  const removeNotification = (notificationId: string) => {
    // Mantener por compatibilidad
    dismissNotification(notificationId);
  };

  const setIsOpen = (isOpen: boolean) => {
    setState(prev => ({ ...prev, isOpen }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed' | 'persistent' | 'autoHide'>) => {
    // ✅ Generar ID único usando actividadId (ya sabemos que siempre existe)
    const uniqueId = `${notification.type}-${notification.actividadId}-${Date.now()}`;
    
    const fullNotification: Notification = {
      ...notification,
      id: uniqueId,
      timestamp: new Date(),
      read: false,
      dismissed: false,
      persistent: true,
      autoHide: false,
      priority: notification.priority || 'medio' // ✅ Asegurar valor por defecto
    };
    
    console.log(`📝 Agregando notificación con ID: ${uniqueId}`);
    notificationService.addNotification(fullNotification);
  };

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isOpen: state.isOpen,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll,
    removeNotification, // Mantener por compatibilidad
    setIsOpen,
    addNotification
  };
}
