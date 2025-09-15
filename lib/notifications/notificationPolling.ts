// /lib/notifications/notificationPolling.ts
'use client';

interface PendingNotification {
  id: string;
  title: string;
  message: string;
  type: 'actividad_nueva' | 'actividad_actualizada' | 'causa_nueva' | 'causa_actualizada' | 'sistema';
  timestamp: string;
  actividadId?: number;
  causaRuc?: string;
  tipoActividad?: string;
  actionUrl?: string;
}

class NotificationPolling {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollInterval = 15000; // 15 segundos
  private lastCheck: Date | null = null;
  private onNewNotification: ((notification: any) => void) | null = null;
  private isWindowActive = true;

  constructor() {
    // Detectar si la ventana está activa
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isWindowActive = !document.hidden;
        if (this.isWindowActive && this.isPolling) {
          // Si la ventana se vuelve activa, hacer check inmediato
          this.checkForNewNotifications();
        }
      });
    }
  }

  start(onNewNotification: (notification: any) => void) {
    if (this.isPolling) return;

    this.onNewNotification = onNewNotification;
    this.isPolling = true;
    this.lastCheck = new Date();

    console.log('📡 Iniciando polling de notificaciones cada', this.pollInterval / 1000, 'segundos');

    // Check inicial
    this.checkForNewNotifications();

    // Intervalo regular
    this.intervalId = setInterval(() => {
      if (this.isWindowActive) {
        this.checkForNewNotifications();
      }
    }, this.pollInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    this.onNewNotification = null;
    console.log('📡 Polling de notificaciones detenido');
  }

  private async checkForNewNotifications() {
    try {
      const since = this.lastCheck?.toISOString() || new Date(Date.now() - 60000).toISOString();
      const response = await fetch(`/api/notifications/pending?since=${since}`);
      
      if (!response.ok) {
        console.warn('⚠️ Error checking notifications:', response.status);
        return;
      }

      const data = await response.json();
      const notifications: PendingNotification[] = data.notifications || [];

      if (notifications.length > 0) {
        console.log(`📬 ${notifications.length} nuevas notificaciones encontradas`);
        
        notifications.forEach(notification => {
          if (this.onNewNotification) {
            // Convertir a formato compatible con nuestro sistema
            const formattedNotification = {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              timestamp: new Date(notification.timestamp),
              read: false,
              dismissed: false,
              persistent: true,
              autoHide: false,
              actividadId: notification.actividadId,
              causaRuc: notification.causaRuc,
              tipoActividad: notification.tipoActividad,
              actionUrl: notification.actionUrl
            };

            this.onNewNotification(formattedNotification);
          }
        });
      }

      this.lastCheck = new Date();

    } catch (error) {
      console.error('❌ Error en polling de notificaciones:', error);
    }
  }

  // Método para hacer check manual (ej: cuando el usuario vuelve a la página)
  checkNow() {
    if (this.isPolling) {
      this.checkForNewNotifications();
    }
  }

  // Cambiar intervalo de polling
  setInterval(newInterval: number) {
    this.pollInterval = newInterval;
    if (this.isPolling) {
      this.stop();
      this.start(this.onNewNotification!);
    }
  }
}

export const notificationPolling = new NotificationPolling();
