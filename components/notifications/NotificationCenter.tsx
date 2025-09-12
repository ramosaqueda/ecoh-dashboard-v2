// components/notifications/NotificationCenter.tsx - CON PERSISTENCIA MEJORADA

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  userEmail: string;
  className?: string;
}

export function NotificationCenter({ userEmail, className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    playTestSound,
    setAudioEnabled,
    isAudioEnabled
  } = useNotifications({
    autoConnect: true,
    enableAudio: true,
    userEmail
  });

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'activities':
        return notification.type === 'actividad_asignada' || notification.type === 'estado_cambiado';
      case 'system':
        return notification.type === 'sistema';
      default:
        return true;
    }
  });

  const getConnectionIcon = () => {
    if (isConnecting) {
      return <Activity className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    return isConnected ? 
      <Wifi className="h-4 w-4 text-green-500" /> : 
      <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getBadgeVariant = () => {
    if (unreadCount === 0) return 'secondary';
    
    const hasUrgent = notifications.some(n => !n.read && n.priority === 'urgent');
    const hasHigh = notifications.some(n => !n.read && n.priority === 'high');
    
    if (hasUrgent) return 'destructive';
    if (hasHigh) return 'default';
    return 'secondary';
  };

  const handleNotificationClick = (notification: any) => {
    // NO marcar automáticamente como leída al hacer click
    // El usuario debe usar el botón específico para marcar como leída
    
    if (notification.type === 'actividad_asignada' && notification.metadata?.actividadId) {
      // Navegar al detalle de la actividad
      window.location.href = `/dashboard/actividades/${notification.metadata.actividadId}`;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-2 hover:bg-accent",
            className
          )}
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge
              variant={getBadgeVariant()}
              className="absolute -top-1 -right-1 h-5 min-w-5 text-xs flex items-center justify-center px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notificaciones</h3>
            {getConnectionIcon()}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-8 px-2"
              title="Limpiar todas las notificaciones"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
            <TabsTrigger value="all" className="text-xs">
              Todo
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              No leídas
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1 h-4 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs">
              Actividades
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              Sistema
            </TabsTrigger>
          </TabsList>

          <div className="max-h-96 overflow-y-auto">
            <TabsContent value={activeTab} className="mt-0">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {activeTab === 'unread' 
                      ? 'No tienes notificaciones sin leer' 
                      : 'No hay notificaciones'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsRead(notification.id)}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Sonido</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isAudioEnabled}
                onCheckedChange={setAudioEnabled}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={playTestSound}
                className="h-6 px-2 text-xs"
                disabled={!isAudioEnabled}
              >
                Probar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Estado:</span>
            <div className="flex items-center gap-1">
              {isConnecting ? (
                <span>Conectando...</span>
              ) : (
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
