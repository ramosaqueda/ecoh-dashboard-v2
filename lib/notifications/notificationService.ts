// /lib/notifications/notificationService.ts
import { Notification, NotificationEventData } from './types';
import { eventManager } from './eventManager';

class NotificationService {
  private notifications: Notification[] = [];
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadStoredNotifications();
    }
  }

  private loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('ecoh_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        // Solo cargar notificaciones no descartadas
        this.notifications = parsedNotifications.filter((n: Notification) => !n.dismissed);
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  }

  private saveNotifications() {
    try {
      // Solo guardar notificaciones no descartadas
      const toStore = this.notifications.filter(n => !n.dismissed);
      localStorage.setItem('ecoh_notifications', JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  connect() {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      this.eventSource = new EventSource('/api/notifications/sse');
      
      this.eventSource.onopen = () => {
        console.log('📡 Conexión SSE establecida');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSSEMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        this.handleReconnection();
      };

    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      this.handleReconnection();
    }
  }

  private handleSSEMessage(data: NotificationEventData) {
    if (data.action === 'add') {
      // Las nuevas notificaciones son persistentes por defecto
      const notification: Notification = {
        ...data.notification,
        persistent: true,
        autoHide: false,
        dismissed: false
      };
      this.addNotification(notification);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`🔄 Reintentando conexión SSE en ${delay}ms (intento ${this.reconnectAttempts + 1})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('❌ Máximo número de reintentos de conexión SSE alcanzado');
    }
  }

  addNotification(notification: Notification) {
    // Verificar si ya existe una notificación similar (por actividadId)
    const existingIndex = this.notifications.findIndex(
      n => n.actividadId === notification.actividadId
    );

    if (existingIndex >= 0) {
      // Actualizar notificación existente
      this.notifications[existingIndex] = {
        ...notification,
        id: this.notifications[existingIndex].id, // Mantener el ID original
        persistent: true,
        dismissed: false
      };
    } else {
      // Agregar nueva notificación
      this.notifications.unshift({
        ...notification,
        persistent: true,
        dismissed: false
      });
    }

    this.saveNotifications();
    this.notifyStateChange();
    
    // Emitir evento para mostrar toast
    eventManager.emit('notification:toast', notification);
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notifyStateChange();
    }
  }

  markAllAsRead() {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveNotifications();
      this.notifyStateChange();
    }
  }

  // Nueva función para descartar (cerrar) notificación
  dismissNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      this.notifications[index].dismissed = true;
      // Remover inmediatamente de la lista
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyStateChange();
    }
  }

  // Nueva función para descartar todas las notificaciones
  dismissAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyStateChange();
  }

  removeNotification(notificationId: string) {
    // Mantener función por compatibilidad, pero usar dismiss
    this.dismissNotification(notificationId);
  }

  getNotifications(): Notification[] {
    // Solo retornar notificaciones no descartadas
    return this.notifications.filter(n => !n.dismissed);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read && !n.dismissed).length;
  }

  private notifyStateChange() {
    const state = {
      notifications: this.getNotifications(),
      unreadCount: this.getUnreadCount(),
      isOpen: false
    };
    
    eventManager.emit('notifications:state-change', state);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Función para limpiar notificaciones antiguas (opcional)
  cleanOldNotifications(daysOld: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(
      n => n.timestamp > cutoffDate || !n.read || n.persistent
    );

    if (this.notifications.length !== initialCount) {
      this.saveNotifications();
      this.notifyStateChange();
    }
  }
}

export const notificationService = new NotificationService();
