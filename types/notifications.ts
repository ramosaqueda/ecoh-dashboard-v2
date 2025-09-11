// types/notifications.ts - CORREGIDO
export interface Notification {
  id: number;  // ✅ CORREGIDO: Cambiado de string a number para coincidir con Prisma
  userId: number;
  title: string;
  message: string;
  type: 'activity_assigned' | 'activity_updated' | 'activity_pending' | 'system';
  read: boolean;
  createdAt: string;
  activityId?: number;  // ✅ AGREGADO: para compatibilidad
  metadata?: {
    activityId?: number;
    activityType?: string;
    ruc?: string;
    assignedBy?: string;
    status?: string;
    dueDate?: string;
    action?: string;
    test?: boolean;
    timestamp?: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export interface SSEMessage {
  type: 'notification' | 'stats' | 'ping';
  data: Notification | NotificationStats | { timestamp: number; message?: string };
}

export interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats;
  isConnected: boolean;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;  // ✅ CORREGIDO: string -> number
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;  // ✅ CORREGIDO: string -> number
  refresh: () => Promise<void>;
}

// ✅ NUEVO: Tipo para datos de Prisma que vienen de la BD
export interface NotificationFromDB {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string | null;
  tipo: string;
  leida: boolean;
  actividad_id: number | null;
  metadata: string | null;
  fecha_creacion: Date;
  fecha_lectura: Date | null;
  createdAt: Date;
  updatedAt: Date;
}