'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  BellRing,
  X,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Activity,
  Volume2,
  VolumeX,
  Settings,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificacionesTiempoReal } from '@/hooks/actividades';
import { toast } from 'sonner';
import { soundNotification } from '@/utils/soundNotification';

export default function NotificacionesHeader() {
  const {
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    ordenAscendente,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    cambiarOrden,
    forzarActualizacion
  } = useNotificacionesTiempoReal();

  const [isOpen, setIsOpen] = useState(false);
  const [sonidoActivado, setSonidoActivado] = useState(true);
  const [sonidoUrgente, setSonidoUrgente] = useState(true);
  const [notificacionesAnteriores, setNotificacionesAnteriores] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const lastNotificationTime = useRef(0);

  // Detectar nuevas notificaciones y reproducir sonido
  useEffect(() => {
    const totalActual = notificaciones.length;
    
    if (totalActual > notificacionesAnteriores && notificacionesAnteriores > 0) {
      const nuevasNotificaciones = totalActual - notificacionesAnteriores;
      const now = Date.now();
      const shouldPlaySound = now - lastNotificationTime.current > 2000;
      
      if (shouldPlaySound && sonidoActivado) {
        lastNotificationTime.current = now;
        reproducirSonidoNotificacion();
      }
      
      // Mostrar toast para nuevas notificaciones
      const ultimasNotificaciones = notificaciones
        .slice(0, Math.min(nuevasNotificaciones, 2))
        .filter(notif => !notif.leida);
      
      ultimasNotificaciones.forEach((notif, index) => {
        setTimeout(() => {
          if (notif.esUrgente) {
            toast.error(notif.titulo, {
              description: notif.mensaje,
              duration: 8000,
              action: {
                label: 'Ver',
                onClick: () => setIsOpen(true)
              },
              icon: '🚨'
            });
          } else {
            toast.info(notif.titulo, {
              description: notif.mensaje,
              duration: 5000,
              action: {
                label: 'Ver',
                onClick: () => setIsOpen(true)
              },
              icon: '🔔'
            });
          }
        }, index * 800);
      });
    }
    
    setNotificacionesAnteriores(totalActual);
  }, [notificaciones.length, sonidoActivado]);

  // Función para reproducir sonido
  const reproducirSonidoNotificacion = async () => {
    try {
      const hayUrgentes = notificaciones.slice(0, 3).some(n => n.esUrgente && !n.leida);
      
      if (hayUrgentes && sonidoUrgente) {
        await soundNotification.playUrgentNotificationSound();
      } else {
        await soundNotification.playNotificationSound('info');
      }
    } catch (error) {
      console.log('No se pudo reproducir sonido:', error);
    }
  };

  // Función para forzar actualización
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forzarActualizacion();
      toast.success('Notificaciones actualizadas', {
        description: 'Se verificó la información más reciente',
        duration: 3000
      });
    } catch (error) {
      toast.error('Error al actualizar notificaciones');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Obtener icono según tipo de notificación
  const getIconoTipo = (tipo: string, esUrgente: boolean) => {
    const baseClass = "h-4 w-4";
    const urgentClass = esUrgente ? "animate-pulse" : "";
    
    switch (tipo) {
      case 'asignacion_recibida':
        return <User className={`${baseClass} text-blue-600 ${urgentClass}`} />;
      case 'cambio_estado':
        return <Activity className={`${baseClass} text-orange-600 ${urgentClass}`} />;
      case 'actividad_completada':
        return <CheckCircle2 className={`${baseClass} text-green-600 ${urgentClass}`} />;
      case 'actividad_vencida':
        return <AlertTriangle className={`${baseClass} text-red-600 ${urgentClass}`} />;
      case 'recordatorio':
        return <Clock className={`${baseClass} text-yellow-600 ${urgentClass}`} />;
      default:
        return <Bell className={`${baseClass} text-gray-600 ${urgentClass}`} />;
    }
  };

  // Obtener color de fondo según tipo
  const getBackgroundColor = (notificacion: any) => {
    if (notificacion.esUrgente) {
      return 'bg-red-50 border-red-200 shadow-md';
    }
    if (!notificacion.leida) {
      return 'bg-blue-50 border-blue-200 shadow-sm';
    }
    return 'bg-gray-50 border-gray-100 opacity-75';
  };

  // Función para probar sonido
  const testearSonido = async () => {
    await reproducirSonidoNotificacion();
    toast.success('Sonido de prueba');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200"
        >
          {notificacionesNoLeidas > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
          
          {notificacionesNoLeidas > 0 && (
            <>
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
              >
                {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
              </Badge>
              
              {/* Efecto de ondas para notificaciones urgentes */}
              {notificaciones.slice(0, 3).some(n => n.esUrgente && !n.leida) && (
                <div className="absolute inset-0 animate-ping">
                  <div className="h-8 w-8 rounded-full bg-red-400 opacity-30"></div>
                </div>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 shadow-xl border-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header del popover */}
        <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-sm">Centro de Notificaciones</h4>
              {notificacionesNoLeidas > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {notificacionesNoLeidas} nuevas
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Botón de actualización manual */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 w-6 p-0"
                title="Actualizar notificaciones"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''} text-gray-500`} />
              </Button>

              {/* Botón de ordenamiento */}
              <Button
                variant="ghost"
                size="sm"
                onClick={cambiarOrden}
                className="h-6 w-6 p-0"
                title={ordenAscendente ? 'Cambiar a más nueva primero' : 'Cambiar a más antigua primero'}
              >
                {ordenAscendente ? (
                  <ArrowUp className="h-3 w-3 text-blue-600" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-blue-600" />
                )}
              </Button>
              
              {/* Configuración de sonido */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3 text-gray-500" />
              </Button>
              
              {/* Marcar todas como leídas */}
              {notificacionesNoLeidas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={marcarTodasComoLeidas}
                  className="text-xs h-6 px-2"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Leídas
                </Button>
              )}
            </div>
          </div>

          {/* Panel de configuración */}
          {showSettings && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="sonido-general"
                    checked={sonidoActivado}
                    onCheckedChange={setSonidoActivado}                    
                  />
                  <Label htmlFor="sonido-general" className="text-xs cursor-pointer">
                    Sonido para notificaciones
                  </Label>
                </div>
                
                {sonidoActivado && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testearSonido}
                    className="h-6 px-2 text-xs"
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    Probar
                  </Button>
                )}
              </div>
              
              {sonidoActivado && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="sonido-urgente"
                    checked={sonidoUrgente}
                    onCheckedChange={setSonidoUrgente}
                    
                  />
                  <Label htmlFor="sonido-urgente" className="text-xs cursor-pointer">
                    Sonido especial para urgentes
                  </Label>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Orden actual:</span>
                  <span className="font-medium">
                    {ordenAscendente ? 'Más antigua primero' : 'Más nueva primero'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido con ScrollArea funcional */}
        <div className="h-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <BellRing className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm">Cargando notificaciones...</span>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-sm text-gray-600">Todo al día</h3>
              <p className="text-xs text-gray-500 mt-1">No hay notificaciones pendientes.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-3 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Verificar ahora
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                {notificaciones.slice(0, 20).map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      getBackgroundColor(notificacion)
                    } ${notificacion.tipo === 'asignacion_recibida' ? 'ring-1 ring-blue-300' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIconoTipo(notificacion.tipo, notificacion.esUrgente)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="text-sm font-medium truncate pr-2">
                            {notificacion.titulo}
                            {notificacion.esUrgente && (
                              <span className="ml-1 text-red-500">🚨</span>
                            )}
                          </h5>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notificacion.leida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => marcarComoLeida(notificacion.id)}
                                className="h-5 w-5 p-0 hover:bg-green-100"
                                title="Marcar como leída"
                              >
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarNotificacion(notificacion.id)}
                              className="h-5 w-5 p-0 hover:bg-red-100"
                              title="Eliminar notificación"
                            >
                              <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {notificacion.mensaje}
                        </p>
                        
                        {/* Metadata */}
                        {notificacion.metadata && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                              RUC: {notificacion.metadata.ruc}
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {notificacion.metadata.tipoActividad}
                            </span>
                          </div>
                        )}
                        
                        {/* Usuario origen */}
                        {notificacion.usuarioOrigen && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <User className="h-3 w-3" />
                            <span>De: {notificacion.usuarioOrigen.nombre}</span>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(notificacion.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Indicador de más notificaciones */}
                {notificaciones.length > 20 && (
                  <div className="text-center py-2 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <span className="text-xs text-gray-500">
                      Y {notificaciones.length - 20} notificaciones más...
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer limpio */}
        <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sonidoActivado ? (
                <Volume2 className="h-3 w-3 text-green-600" />
              ) : (
                <VolumeX className="h-3 w-3 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {sonidoActivado ? 'Sonido activado' : 'Sonido desactivado'}
              </span>
              <span className="text-xs text-gray-400 mx-2">•</span>
              <span className="text-xs text-gray-500">
                {ordenAscendente ? '↑ Más antigua primera' : '↓ Más nueva primera'}
              </span>
            </div>
          </div>
          
          <div className="text-center mt-1">
            <span className="text-xs text-gray-400">
              Actualización cada 8s • Última verificación: {format(new Date(), 'HH:mm')}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
