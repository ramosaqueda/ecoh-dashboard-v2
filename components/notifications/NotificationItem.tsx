// components/notifications/NotificationItem.tsx - VERSIÓN CON BOTÓN CERRAR

'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  UserPlus,
  RefreshCw,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { Notification, NotificationPriority, NotificationType } from '@/lib/notifications/types';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
  onClick,
  className
}: NotificationItemProps) {
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'actividad_asignada':
        return <UserPlus className="h-4 w-4" />;
      case 'estado_cambiado':
        return <RefreshCw className="h-4 w-4" />;
      case 'nueva_causa':
        return <Info className="h-4 w-4" />;
      case 'sistema':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-blue-500';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return { variant: 'destructive' as const, label: 'Urgente' };
      case 'high':
        return { variant: 'default' as const, label: 'Alta' };
      case 'medium':
        return { variant: 'secondary' as const, label: 'Media' };
      case 'low':
        return { variant: 'outline' as const, label: 'Baja' };
      default:
        return { variant: 'outline' as const, label: 'Normal' };
    }
  };

  const getTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Hace un momento';
    }
  };

  const getMetadataInfo = () => {
    if (!notification.metadata) return null;

    switch (notification.type) {
      case 'actividad_asignada':
        return (
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <div>Causa: <span className="font-mono">{notification.metadata.causaRuc}</span></div>
            <div>Tipo: {notification.metadata.tipoActividad}</div>
            <div>Asignado por: {notification.metadata.asignadoPor}</div>
            {notification.metadata.fechaInicio && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Inicio: {new Date(notification.metadata.fechaInicio).toLocaleDateString('es-CL')}
              </div>
            )}
          </div>
        );

      case 'estado_cambiado':
        return (
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <div>Causa: <span className="font-mono">{notification.metadata.causaRuc}</span></div>
            <div className="flex items-center gap-2">
              <span className="line-through text-red-500">{notification.metadata.estadoAnterior}</span>
              <span>→</span>
              <span className="text-green-600 font-medium">{notification.metadata.estadoNuevo}</span>
            </div>
            <div>Actualizado por: {notification.metadata.cambiadoPor}</div>
          </div>
        );

      default:
        return null;
    }
  };

  const priorityBadge = getPriorityBadge(notification.priority);
  const iconColor = getPriorityColor(notification.priority);
  const hasAction = notification.type === 'actividad_asignada' && notification.metadata?.actividadId;

  return (
    <div
      className={cn(
        "relative p-4 hover:bg-accent/50 transition-colors",
        !notification.read && "bg-blue-50/50 border-l-4 border-l-blue-500",
        className
      )}
    >
      {/* Botón cerrar */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        title="Cerrar notificación"
      >
        <X className="h-3 w-3" />
      </Button>

      <div className="flex items-start gap-3 pr-8">
        <div className={cn("mt-0.5", iconColor)}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2 mb-1 cursor-pointer">
            <h4 className={cn(
              "text-sm font-medium truncate",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            
            {!notification.read && (
              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2 leading-relaxed cursor-pointer">
            {notification.message}
          </p>

          {getMetadataInfo()}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Badge variant={priorityBadge.variant} className="text-xs">
                {priorityBadge.label}
              </Badge>
              
              <span className="text-xs text-muted-foreground">
                {getTimeAgo(notification.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {hasAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/dashboard/actividades/${notification.metadata?.actividadId}`;
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}

              {!notification.read && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Marcar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
