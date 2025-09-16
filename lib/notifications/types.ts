// /lib/notifications/types.ts
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: 'actividad_nueva' | 'actividad_actualizada';
  timestamp: Date;
  userId?: string;  
  read: boolean;
  dismissed: boolean;
  persistent: boolean;
  autoHide?: boolean;
  hideDelay?: number;
  priority: 'bajo' | 'medio' | 'alta' | 'critica';
}

export interface ActividadNotification extends BaseNotification {
  type: 'actividad_nueva' | 'actividad_actualizada';
  title: string;
  message: string;
  actividadId: number;
  causaRuc: string;
  tipoActividad: string;
  actionUrl: string;
  priority: 'bajo' | 'medio' | 'alta' | 'critica';
}

// ✅ SOLO USAMOS NOTIFICACIONES DE ACTIVIDADES
export type Notification = ActividadNotification;

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
}

export interface NotificationEventData {
  notification: Notification;
  action: 'add' | 'update' | 'remove' | 'mark_read' | 'dismiss';
}
