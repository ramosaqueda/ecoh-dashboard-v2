// lib/notifications/types.ts

export type NotificationType = 'actividad_asignada' | 'estado_cambiado' | 'nueva_causa' | 'sistema';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface ActividadAsignadaNotification extends BaseNotification {
  type: 'actividad_asignada';
  metadata: {
    actividadId: number;
    causaRuc: string;
    tipoActividad: string;
    asignadoPor: string;
    fechaInicio: string;
  };
}

export interface EstadoCambiadoNotification extends BaseNotification {
  type: 'estado_cambiado';
  metadata: {
    actividadId: number;
    causaRuc: string;
    estadoAnterior: string;
    estadoNuevo: string;
    cambiadoPor: string;
  };
}

export type Notification = ActividadAsignadaNotification | EstadoCambiadoNotification | BaseNotification;

export interface NotificationEvent {
  type: 'notification' | 'heartbeat' | 'error';
  data: Notification | { message: string } | null;
  timestamp: number;
}

export interface NotificationFilter {
  types?: NotificationType[];
  priority?: NotificationPriority[];
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}