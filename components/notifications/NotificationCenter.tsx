// /components/notifications/NotificationCenter.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCheck, 
  X,
  Bell,
  BellOff,
  Trash2,
  RefreshCw
} from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useRouter } from 'next/navigation';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    dismissNotification,
    dismissAll,
    refreshNotifications,
    isLoading
  } = useNotifications();
  
  const router = useRouter();

  const handleAction = (url: string) => {
    router.push(url);
    onClose();
  };

  const handleRefresh = async () => {
    console.log('🔄 Forzando actualización de notificaciones...');
    await refreshNotifications();
  };

  const handleDismissNotification = (id: string) => {
    dismissNotification(id);
  };

  const handleDismissAll = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar todas las notificaciones?')) {
      dismissAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Botón de recarga */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Actualizar notificaciones"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Marcar todas como leídas */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
          
          {/* Cerrar todas */}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
              title="Cerrar todas las notificaciones"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Cerrar panel */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <BellOff className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-sm text-center">
              No tienes notificaciones
            </p>
            <p className="text-xs text-center mt-1 text-gray-400">
              Te notificaremos cuando haya nuevas actividades
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDismiss={handleDismissNotification}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer con estadísticas */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
          {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} 
          {unreadCount > 0 && (
            <span className="text-blue-600 font-medium">
              {' '}• {unreadCount} sin leer
            </span>
          )}
        </div>
      )}
    </div>
  );
}
