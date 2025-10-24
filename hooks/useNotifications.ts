// /hooks/useNotifications.ts
// VERSIÓN ACTUALIZADA: Integración completa con BD
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

  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        
        // 🔄 NUEVO: Conectar al servicio (ya carga desde BD)
        await notificationService.connect();

        // Configurar listeners
        const unsubscribeStateChange = eventManager.on('notifications:state-change', 
          (newState: NotificationState) => {
            setState(newState);
            setIsLoading(false);
          }
        );

        const unsubscribeToast = eventManager.on('notification:toast', 
          (notification: Notification) => {
            // Generar clave única para evitar duplicados
            const toastKey = `actividad-${notification.actividadId}`;
            
            // Reproducir sonido
            audioManager.playNotificationSound();
            
            // Crear toast persistente
            toast(notification.title, {
              id: toastKey,
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
                // 📝 NUEVO: Llamada async para sincronizar con BD
                notificationService.markAsRead(notification.id);
              }
            });
            
            console.log(`🎯 Toast creado con ID: ${toastKey} para: ${notification.title}`);
          }
        );

        // 🔔 INICIAR POLLING (mantener como está)
        notificationPolling.start((notification: Notification) => {
          console.log('📬 Nueva notificación recibida vía polling:', notification.title);
          notificationService.addNotification(notification);
        });

        // Configurar cleanup
        const cleanup = () => {
          unsubscribeStateChange();
          unsubscribeToast();
          notificationService.disconnect();
          notificationPolling.stop();
        };

        // Retornar función de cleanup para el useEffect
        return cleanup;

      } catch (error) {
        console.error('❌ Error inicializando notificaciones:', error);
        setIsLoading(false);
      }
    };

    // Ejecutar inicialización
    initializeNotifications();

  }, []); // Solo ejecutar una vez

  // 📝 ACTUALIZADO: Funciones ahora son async para sincronizar con BD
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marcando como leída:', error);
      toast.error('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      toast.error('Error al marcar todas como leídas');
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await notificationService.dismissNotification(notificationId);
    } catch (error) {
      console.error('Error descartando notificación:', error);
      toast.error('Error al descartar notificación');
    }
  };

  const dismissAll = async () => {
    try {
      await notificationService.dismissAll();
      toast.success('Todas las notificaciones descartadas');
    } catch (error) {
      console.error('Error descartando todas:', error);
      toast.error('Error al descartar todas las notificaciones');
    }
  };

  // Mantener por compatibilidad
  const removeNotification = async (notificationId: string) => {
    return dismissNotification(notificationId);
  };

  const setIsOpen = (isOpen: boolean) => {
    setState(prev => ({ ...prev, isOpen }));
  };

  // 📝 ACTUALIZADO: Crear notificación directamente en BD
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'dismissed' | 'persistent' | 'autoHide'>) => {
    try {
      // 🆕 NUEVO: Crear notificación directamente en BD vía API
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || 'medio',
          actividadId: notification.actividadId,
          metadata: {
            causaRuc: notification.causaRuc,
            tipoActividad: notification.tipoActividad,
            actionUrl: notification.actionUrl
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const createdNotification = await response.json();
      console.log(`✅ Notificación creada en BD: ${createdNotification.id}`);

      // La notificación aparecerá automáticamente via SSE o polling
      return createdNotification;

    } catch (error) {
      console.error('❌ Error creando notificación en BD:', error);
      
      // 🔄 FALLBACK: Crear localmente si falla la BD
      const fallbackId = `local-${notification.type}-${notification.actividadId}-${Date.now()}`;
      
      const fullNotification: Notification = {
        ...notification,
        id: fallbackId,
        timestamp: new Date(),
        read: false,
        dismissed: false,
        persistent: true,
        autoHide: false,
        priority: notification.priority || 'medio'
      };
      
      notificationService.addNotification(fullNotification);
      toast.error('Error al guardar notificación, se guardó localmente');
      
      return fullNotification;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Refrescar notificaciones desde BD
  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      await notificationService.refreshFromDB();
      toast.success('Notificaciones actualizadas');
    } catch (error) {
      console.error('Error refrescando notificaciones:', error);
      toast.error('Error al actualizar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isOpen: state.isOpen,
    isLoading,
    
    // Funciones async actualizadas
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll,
    addNotification,
    refreshNotifications,
    
    // Funciones sincrónicas
    setIsOpen,
    
    // Mantener por compatibilidad
    removeNotification
  };
}