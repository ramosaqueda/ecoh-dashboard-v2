// components/notifications/NotificationCenter.tsx - CORREGIDO
'use client';

import { useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Calendar,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { Notification } from '@/types/notifications';

// ✅ FUNCIÓN HELPER PARA FORMATEAR FECHAS
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Hace un momento';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInDays < 7) return `Hace ${diffInDays}d`;
  return date.toLocaleDateString();
}

// ✅ FUNCIÓN HELPER PARA OBTENER ICONO Y COLOR SEGÚN TIPO
function getNotificationIcon(type: string) {
  switch (type) {
    case 'activity_assigned':
      return { icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-l-blue-500' };
    case 'activity_updated':
      return { icon: CheckCheck, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-l-green-500' };
    case 'activity_pending':
      return { icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-l-orange-500' };
    case 'system':
      return { icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-l-purple-500' };
    default:
      return { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-l-gray-500' };
  }
}

export default function NotificationCenter() {
  const {
    notifications,
    stats,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasUnread = stats.unread > 0;

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Minimum animation time
    }
  };

  // ✅ RENDERIZAR COMPONENTE INDIVIDUAL DE NOTIFICACIÓN
  const renderNotification = (notification: Notification) => {
    const { icon: IconComponent, color, bgColor, borderColor } = getNotificationIcon(notification.type);
    
    return (
      <div
        key={notification.id}
        className={`p-3 border-l-4 ${borderColor} ${bgColor} ${
          !notification.read ? 'opacity-100' : 'opacity-70'
        } transition-opacity hover:opacity-100`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className={`h-4 w-4 ${color}`} />
              <h4 className="text-sm font-medium truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            {/* Metadata adicional */}
            {notification.metadata?.ruc && (
              <div className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">RUC:</span> {notification.metadata.ruc}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.createdAt)}
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.read && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/80"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Marcar como leída</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar notificación</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0"
              >
                {hasUnread ? (
                  <BellRing className="h-4 w-4 text-orange-600 animate-pulse" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                
                {hasUnread && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                  >
                    {stats.unread > 99 ? '99+' : stats.unread}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Notificaciones 
              {hasUnread && ` (${stats.unread} nuevas)`}
              {isLoading && ' - Cargando...'}
            </p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent 
          className="w-80 max-h-96" 
          align="end"
          sideOffset={5}
        >
          {/* Header */}
          {/* Header */}
          <div className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Notificaciones</h4>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-600" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-600" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {stats.unread}/{stats.total}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleRefresh}
                      disabled={isLoading || isRefreshing}
                    >
                      <RefreshCw className={`h-3 w-3 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualizar notificaciones</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />

          {/* Connection Status */}
          <div className="px-2 py-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-muted-foreground">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              {isLoading && (
                <span className="text-muted-foreground">Cargando...</span>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Actions */}
          {hasUnread && (
            <>
              <DropdownMenuItem 
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como leídas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Notifications List */}
          <ScrollArea className="max-h-64">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <RefreshCw className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Cargando notificaciones...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay notificaciones
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Te notificaremos cuando tengas nuevas actividades
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(renderNotification)}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>
                  {isConnected ? 'Tiempo real activo' : 'Modo offline'}
                </span>
              </div>
              <span>v2.0</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}