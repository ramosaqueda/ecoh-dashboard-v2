// ==========================================
// ARCHIVO: /lib/notifications/notificationService.ts (ACTUALIZADO)
// ==========================================

import { Notification, NotificationEventData } from '../types';
import { eventManager } from '../eventManager';
 

interface NotificationFromDB {
  id: string;
  type: 'actividad_nueva' | 'actividad_actualizada';
  title: string;
  message: string;
  priority: 'bajo' | 'medio' | 'alta' | 'critica';
  userId: number;
  userEmail: string;
  read: boolean;
  dismissed: boolean;
  actividadId?: number;
  metadata?: any;
  createdAt: Date;
  expiresAt?: Date;
  actividad?: {
    id: number;
    causa: {
      ruc: string;
      denominacionCausa?: string;
    };
    tipoActividad: {
      nombre: string;
    };
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadNotificationsFromAPI();
    }
  }

  // ==========================================
  // MÉTODOS DE CARGA Y SINCRONIZACIÓN CON BD
  // ==========================================

  private async loadNotificationsFromAPI() {
    try {
      const response = await fetch('/api/notifications?limit=100');
      if (!response.ok) throw new Error('Error cargando notificaciones');
      
      const data = await response.json();
      this.notifications = data.notifications.map(this.convertFromDB);
      this.notifyStateChange();
      
      console.log(`📬 Cargadas ${this.notifications.length} notificaciones desde BD`);
    } catch (error) {
      console.error('Error loading notifications from API:', error);
      // Fallback: intentar cargar desde localStorage si falla la API
      this.loadStoredNotifications();
    }
  }

  private convertFromDB(dbNotification: NotificationFromDB): Notification {
    const baseNotification = {
      id: dbNotification.id,
      title: dbNotification.title,
      message: dbNotification.message,
      type: dbNotification.type,
      timestamp: new Date(dbNotification.createdAt),
      userId: dbNotification.userId.toString(),      
      read: dbNotification.read,
      dismissed: dbNotification.dismissed,
      persistent: true,
      autoHide: false,
      hideDelay: 0,      
      priority: dbNotification.priority
    };

    // Construir URL de acción si hay actividad relacionada
    let actionUrl = '';
    if (dbNotification.actividadId) {
      actionUrl = ` /dashboard/todo?highlight=${dbNotification.actividadId}`;
    }

    // Crear notificación según el tipo
    if (dbNotification.type === 'actividad_nueva' || dbNotification.type === 'actividad_actualizada') {
      return {
        ...baseNotification,
        actividadId: dbNotification.actividadId || 0,
        causaRuc: dbNotification.actividad?.causa.ruc || '',
        tipoActividad: dbNotification.actividad?.tipoActividad.nombre || '',
        actionUrl
      } as Notification;
    }

    return baseNotification as Notification;
  }

  private async saveNotificationToDB(notification: Notification): Promise<void> {
    try {
      const payload = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: (notification as any).priority || 'medio',
        actividadId: 'actividadId' in notification ? notification.actividadId : undefined,
        metadata: {
          persistent: notification.persistent,
          autoHide: notification.autoHide
        }
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error guardando notificación');
      
      const savedNotification = await response.json();
      console.log(`💾 Notificación guardada en BD: ${savedNotification.id}`);
      
    } catch (error) {
      console.error('Error saving notification to DB:', error);
    }
  }

  // ==========================================
  // MÉTODOS LEGACY (MANTENER PARA COMPATIBILIDAD)
  // ==========================================

  private loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('ecoh_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications = parsedNotifications.filter((n: Notification) => !n.dismissed);
        this.notifyStateChange();
        console.log(`📦 Fallback: Cargadas ${this.notifications.length} notificaciones desde localStorage`);
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  }

  private saveNotifications() {
    try {
      const toStore = this.notifications.filter(n => !n.dismissed);
      localStorage.setItem('ecoh_notifications', JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  // ==========================================
  // MÉTODOS PRINCIPALES (ACTUALIZADOS)
  // ==========================================

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
      const notification: Notification = {
        ...data.notification,
        persistent: true,
        autoHide: false,
        dismissed: false
      };
      
      // Agregar a memoria local para UI reactiva
      this.addToMemory(notification);
      
      // La notificación ya debería estar en BD (enviada por SSE)
      // Solo sincronizar estado local
    }
  }

  async addNotification(notification: Notification) {
    // 1. Agregar a memoria para UI inmediata
    this.addToMemory(notification);
    
    // 2. Guardar en BD de forma asíncrona
    await this.saveNotificationToDB(notification);
    
    // 3. Emitir evento para toast
    eventManager.emit('notification:toast', notification);
  }

  private addToMemory(notification: Notification) {
    // Verificar si ya existe una notificación similar
    const existingIndex = this.notifications.findIndex(
      n => n.type === notification.type && 
           'actividadId' in n && 'actividadId' in notification &&
           n.actividadId === notification.actividadId
    );

    if (existingIndex >= 0) {
      this.notifications[existingIndex] = {
        ...notification,
        id: this.notifications[existingIndex].id, // Mantener ID original
        persistent: true,
        dismissed: false
      };
    } else { 
      this.notifications.unshift({
        ...notification,
        persistent: true,
        dismissed: false
      });
    }

    this.saveNotifications(); // Backup en localStorage
    this.notifyStateChange();
  }

  async markAsRead(notificationId: string) {
    // 1. Actualizar en memoria local
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.notifyStateChange();
    }

    // 2. Actualizar en BD
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      console.log(`👁️ Notificación ${notificationId} marcada como leída`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    // 1. Actualizar en memoria local
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

    // 2. Actualizar en BD
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      console.log(`👁️ Todas las notificaciones marcadas como leídas`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async dismissNotification(notificationId: string) {
    // 1. Actualizar en memoria local
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      this.notifications[index].dismissed = true;
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyStateChange();
    }

    // 2. Actualizar en BD
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true })
      });
      console.log(`🗑️ Notificación ${notificationId} descartada`);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  async dismissAll() {
    // 1. Actualizar en memoria local
    this.notifications = [];
    this.saveNotifications();
    this.notifyStateChange();

    // 2. Actualizar en BD
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss_all' })
      });
      console.log(`🗑️ Todas las notificaciones descartadas`);
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  removeNotification(notificationId: string) {
    // Mantener por compatibilidad, usar dismiss
    this.dismissNotification(notificationId);
  }

  getNotifications(): Notification[] {
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

  // ==========================================
  // MÉTODOS DE SINCRONIZACIÓN Y LIMPIEZA
  // ==========================================

  async refreshFromAPI() {
    console.log('🔄 Sincronizando notificaciones desde API...');
    await this.loadNotificationsFromAPI();
  }

  async cleanupExpired() {
    try {
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`🧹 Limpieza completada: ${result.deletedCount} notificaciones eliminadas`);
        
        // Recargar después de limpieza
        await this.refreshFromAPI();
      }
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  async getStats() {
    try {
      const response = await fetch('/api/notifications/stats');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting notification stats:', error);
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE CONEXIÓN (MANTENIDOS)
  // ==========================================

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

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Función para limpiar notificaciones antiguas (local + BD)
  async cleanOldNotifications(daysOld: number = 7) {
    // Limpiar local
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

    // Limpiar BD
    await this.cleanupExpired();
  }
}

export const notificationService = new NotificationService();