// /lib/notifications/types.ts
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: 'actividad_nueva' | 'actividad_actualizada' | 'causa_nueva' | 'causa_actualizada' | 'sistema';
  timestamp: Date;
  userId?: string;
  read: boolean;
  dismissed: boolean; // Nueva propiedad para controlar si el usuario la cerró
  persistent: boolean; // Nueva propiedad para notificaciones que no se auto-ocultan
  autoHide?: boolean; // Opcional: si la notificación se oculta automáticamente
  hideDelay?: number; // Tiempo en ms antes de auto-ocultar (si autoHide es true)
}

export interface ActividadNotification extends BaseNotification {
  type: 'actividad_nueva' | 'actividad_actualizada';
  actividadId: number;
  causaRuc: string;
  tipoActividad: string;
  actionUrl: string;
}

export interface CausaNotification extends BaseNotification {
  type: 'causa_nueva' | 'causa_actualizada';
  causaId: number;
  causaRuc: string;
  actionUrl: string;
}

export interface SystemNotification extends BaseNotification {
  type: 'sistema';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type Notification = ActividadNotification | CausaNotification | SystemNotification;

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
}

export interface NotificationEventData {
  notification: Notification;
  action: 'add' | 'update' | 'remove' | 'mark_read' | 'dismiss';
}
