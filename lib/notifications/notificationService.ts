// lib/notifications/notificationService.ts
// VERSIÓN ACTUALIZADA: Espera a Clerk antes de inicializar
import { Notification, NotificationEventData } from './types';
import { eventManager } from './eventManager';

// Variable de configuración para habilitar/deshabilitar SSE
const ENABLE_SSE = process.env.NEXT_PUBLIC_ENABLE_SSE !== 'false';

class NotificationService {
  private notifications: Notification[] = [];
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;
  private isInitialized = false;
  private isConnecting = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // NO inicializar automáticamente - esperar a que se llame manualmente
    console.log('📦 NotificationService creado (esperando inicialización manual)');
  }

  // 🔄 MODIFICADO: No ejecutar automáticamente, retornar Promise
  async initializeFromDB() {
    // Si ya hay una inicialización en progreso, esperar a que termine
    if (this.initializationPromise) {
      console.log('⏳ Esperando inicialización en progreso...');
      return this.initializationPromise;
    }

    // Si ya está inicializado, no hacer nada
    if (this.isInitialized) {
      console.log('✅ NotificationService ya inicializado');
      return Promise.resolve();
    }

    // Crear la promesa de inicialización
    this.initializationPromise = this._performInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _performInitialization() {
    try {
      console.log('📡 Cargando notificaciones desde BD...');
      
      const response = await fetch('/api/notifications?unread=false&limit=50');
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ No autenticado aún - se reintentará cuando Clerk esté listo');
          throw new Error('NOT_AUTHENTICATED');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convertir las notificaciones de BD al formato interno
      this.notifications = data.notifications.map((dbNotif: any) => ({
        id: dbNotif.id,
        title: dbNotif.title,
        message: dbNotif.message,
        type: dbNotif.type,
        priority: dbNotif.priority,
        timestamp: new Date(dbNotif.createdAt),
        read: dbNotif.read,
        dismissed: dbNotif.dismissed,
        persistent: true,
        autoHide: false,
        actividadId: dbNotif.actividadId,
        causaRuc: dbNotif.actividad?.causa?.ruc,
        tipoActividad: dbNotif.actividad?.tipoActividad?.nombre,
        actionUrl: dbNotif.actividadId ? `/dashboard/todo?highlight=${dbNotif.actividadId}` : undefined
      })).filter((n: Notification) => !n.dismissed);

      console.log(`✅ ${this.notifications.length} notificaciones cargadas desde BD`);
      this.isInitialized = true;
      this.notifyStateChange();

    } catch (error) {
      console.error('❌ Error cargando notificaciones desde BD:', error);
      
      // Si es error de autenticación, no usar fallback
      if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
        throw error;
      }
      
      // Fallback a localStorage como respaldo
      this.loadStoredNotifications();
      this.isInitialized = true;
    }
  }

  // 📦 MANTENER COMO FALLBACK: Cargar desde localStorage
  private loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('ecoh_notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications = parsedNotifications.filter((n: Notification) => !n.dismissed);
        console.log(`📦 Fallback: ${this.notifications.length} notificaciones desde localStorage`);
        this.notifyStateChange();
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  }

  // 💾 ACTUALIZADO: Sincronizar con BD en lugar de solo localStorage
  private async syncWithDB(notification: Notification, action: 'update' | 'dismiss') {
    try {
      if (action === 'dismiss') {
        const response = await fetch(`/api/notifications/${notification.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        console.log(`🗑️ Notificación ${notification.id} descartada en BD`);
        
      } else if (action === 'update') {
        const response = await fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            read: notification.read 
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        console.log(`📝 Notificación ${notification.id} actualizada en BD`);
      }

    } catch (error) {
      console.error(`❌ Error sincronizando con BD (${action}):`, error);
      this.saveNotifications();
    }
  }

  // 📦 MANTENER: Guardar en localStorage como respaldo
  private saveNotifications() {
    try {
      const toStore = this.notifications.filter(n => !n.dismissed);
      localStorage.setItem('ecoh_notifications', JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  async connect() {
    if (!ENABLE_SSE) {
      console.log('⚠️ SSE deshabilitado por configuración');
      return;
    }

    // Asegurar que estamos inicializados antes de conectar
    if (!this.isInitialized) {
      try {
        await this.initializeFromDB();
      } catch (error) {
        console.error('No se pudo inicializar antes de conectar SSE:', error);
        return;
      }
    }

    if (this.isConnecting) {
      console.log('⚠️ Ya hay un intento de conexión SSE en progreso');
      return;
    }

    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.log('✅ Conexión SSE ya establecida');
      return;
    }

    try {
      this.isConnecting = true;
      console.log('🔌 Intentando conectar SSE...');
      
      this.eventSource = new EventSource('/api/notifications/sse');
      
      this.eventSource.onopen = () => {
        console.log('✅ Conexión SSE establecida exitosamente');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connection' || data.type === 'ping') {
            return;
          }
          
          this.handleSSEMessage(data);
        } catch (error) {
          console.error('❌ Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ SSE Connection Error:', error);
        this.isConnecting = false;
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('⚠️ Conexión SSE cerrada, intentando reconectar...');
          this.handleReconnection();
        }
      };

    } catch (error) {
      console.error('❌ Error al establecer conexión SSE:', error);
      this.isConnecting = false;
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
      this.addNotification(notification);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
      this.reconnectAttempts++;
      
      console.log(`🔄 Reintentando conexión SSE en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.warn('⚠️ Máximo número de reintentos de conexión SSE alcanzado');
      console.warn('💡 Las notificaciones seguirán funcionando, pero solo desde la BD');
      
      setTimeout(() => {
        console.log('🔄 Reseteando contador de reintentos SSE');
        this.reconnectAttempts = 0;
      }, 300000);
    }
  }

  addNotification(notification: Notification) {
    const existingIndex = this.notifications.findIndex(
      n => n.actividadId === notification.actividadId
    );

    if (existingIndex >= 0) {
      this.notifications[existingIndex] = {
        ...notification,
        id: this.notifications[existingIndex].id,
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

    this.saveNotifications();
    this.notifyStateChange();
    eventManager.emit('notification:toast', notification);
  }

  async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      await this.syncWithDB(notification, 'update');
      this.notifyStateChange();
    }
  }

  async markAllAsRead() {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      unreadNotifications.forEach(notification => {
        notification.read = true;
      });

      console.log(`📝 ${unreadNotifications.length} notificaciones marcadas como leídas en BD`);
      
      this.saveNotifications();
      this.notifyStateChange();

    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
    }
  }

  async dismissNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      const notification = this.notifications[index];
      await this.syncWithDB(notification, 'dismiss');
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyStateChange();
    }
  }

  async dismissAll() {
    if (this.notifications.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss_all' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log(`🗑️ ${this.notifications.length} notificaciones descartadas en BD`);
      
      this.notifications = [];
      this.saveNotifications();
      this.notifyStateChange();

    } catch (error) {
      console.error('❌ Error descartando todas las notificaciones:', error);
    }
  }

  removeNotification(notificationId: string) {
    return this.dismissNotification(notificationId);
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

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('📡 Conexión SSE cerrada');
    }
  }

  async cleanOldNotifications(daysOld: number = 7) {
    try {
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

    } catch (error) {
      console.error('Error cleaning old notifications:', error);
    }
  }

  async refreshFromDB() {
    this.isInitialized = false;
    this.initializationPromise = null;
    await this.initializeFromDB();
  }

  getConnectionStatus() {
    return {
      isConnected: this.eventSource?.readyState === EventSource.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      enabled: ENABLE_SSE,
      isInitialized: this.isInitialized
    };
  }
}

export const notificationService = new NotificationService();
