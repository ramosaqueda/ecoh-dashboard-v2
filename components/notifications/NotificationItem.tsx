// /components/notifications/NotificationItem.tsx
'use client';

import { Notification } from '@/lib/notifications/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  AlertCircle, 
  Eye, 
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction?: (url: string) => void;
}

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDismiss,
  onAction 
}: NotificationItemProps) {

  const getIcon = () => {
    switch (notification.type) {
      case 'actividad_nueva':
      case 'actividad_actualizada':
        return <Calendar className="h-4 w-4" />;
      case 'causa_nueva':
      case 'causa_actualizada':
        return <FileText className="h-4 w-4" />;
      case 'sistema':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'actividad_nueva':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'actividad_actualizada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'causa_nueva':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'causa_actualizada':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sistema':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'actividad_nueva':
        return 'Nueva Actividad';
      case 'actividad_actualizada':
        return 'Actividad Actualizada';
      case 'causa_nueva':
        return 'Nueva Causa';
      case 'causa_actualizada':
        return 'Causa Actualizada';
      case 'sistema':
        return 'Sistema';
      default:
        return 'Notificación';
    }
  };

  const handleAction = () => {
    if ('actionUrl' in notification && notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
    }
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  return (
    <div className={cn(
      "relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
      !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
    )}>
      {/* Indicador de no leída */}
      {!notification.read && (
        <div className="absolute left-2 top-6 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start gap-3 ml-3">
        {/* Icono */}
        <div className={cn(
          "flex-shrink-0 p-2 rounded-full",
          getTypeColor()
        )}>
          {getIcon()}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="outline" className={cn("text-xs", getTypeColor())}>
              {getTypeLabel()}
            </Badge>
            <div className="flex items-center gap-1">
              {/* Botón marcar como leída */}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  title="Marcar como leída"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              {/* Botón cerrar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                title="Cerrar notificación"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Título */}
          <h4 className="font-medium text-sm text-gray-900 mb-1">
            {notification.title}
          </h4>

          {/* Mensaje */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>

          {/* Información adicional */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(notification.timestamp, { 
                addSuffix: true, 
                locale: es 
              })}
            </span>

            {/* Botón de acción */}
            {'actionUrl' in notification && notification.actionUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
                className="h-7 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
            )}
          </div>

          {/* Información específica por tipo */}
          {'causaRuc' in notification && (
            <div className="mt-2 text-xs text-gray-500">
              RUC: {notification.causaRuc}
              {'tipoActividad' in notification && (
                <span className="ml-2">• {notification.tipoActividad}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
