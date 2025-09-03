'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  BellRing,
  X,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  Eye,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificacionesTiempoReal } from '@/hooks/actividades';

interface ConfigNotificaciones {
  sonidoActivado: boolean;
  notificacionesAsignacion: boolean;
  notificacionesCambioEstado: boolean;
  notificacionesVencimiento: boolean;
  autoMarcarLeidas: boolean;
}

export default function NotificacionesTiempoReal() {
  const {
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  } = useNotificacionesTiempoReal();

  const [config, setConfig] = useState<ConfigNotificaciones>({
    sonidoActivado: true,
    notificacionesAsignacion: true,
    notificacionesCambioEstado: true,
    notificacionesVencimiento: true,
    autoMarcarLeidas: false
  });

  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Obtener icono según tipo de notificación
  const getIconoTipo = (tipo: string, esUrgente: boolean) => {
    const baseClass = "h-4 w-4";
    
    switch (tipo) {
      case 'asignacion_recibida':
        return <User className={`${baseClass} text-blue-600`} />;
      case 'cambio_estado':
        return <Activity className={`${baseClass} text-orange-600`} />;
      case 'actividad_completada':
        return <CheckCircle2 className={`${baseClass} text-green-600`} />;
      case 'actividad_vencida':
        return <AlertTriangle className={`${baseClass} text-red-600`} />;
      default:
        return <Bell className={`${baseClass} text-gray-600`} />;
    }
  };

  // Obtener color de fondo según tipo y urgencia
  const getColorFondo = (tipo: string, esUrgente: boolean) => {
    if (esUrgente) return 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200';
    
    switch (tipo) {
      case 'asignacion_recibida':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
      case 'cambio_estado':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200';
      case 'actividad_completada':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'actividad_vencida':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    }
  };

  // Manejar configuración
  const handleConfigChange = (key: keyof ConfigNotificaciones, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Filtrar notificaciones según configuración
  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (!config.notificacionesAsignacion && notif.tipo === 'asignacion_recibida') return false;
    if (!config.notificacionesCambioEstado && (notif.tipo === 'cambio_estado' || notif.tipo === 'actividad_completada')) return false;
    if (!config.notificacionesVencimiento && notif.tipo === 'actividad_vencida') return false;
    return true;
  });



  const notificacionesRecientes = notificacionesFiltradas.slice(0, 5);

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="relative">
                <Bell className="h-5 w-5 text-purple-600" />
                {notificacionesNoLeidas > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              Notificaciones
              {notificacionesNoLeidas > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {notificacionesNoLeidas}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              {/* Configuración */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Configuración de Notificaciones</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sonido" className="text-sm">Sonido</Label>
                        <Switch
                          id="sonido"
                          checked={config.sonidoActivado}
                          onCheckedChange={(checked) => handleConfigChange('sonidoActivado', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="asignacion" className="text-sm">Asignaciones</Label>
                        <Switch
                          id="asignacion"
                          checked={config.notificacionesAsignacion}
                          onCheckedChange={(checked) => handleConfigChange('notificacionesAsignacion', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cambios" className="text-sm">Cambios de Estado</Label>
                        <Switch
                          id="cambios"
                          checked={config.notificacionesCambioEstado}
                          onCheckedChange={(checked) => handleConfigChange('notificacionesCambioEstado', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vencimiento" className="text-sm">Vencimientos</Label>
                        <Switch
                          id="vencimiento"
                          checked={config.notificacionesVencimiento}
                          onCheckedChange={(checked) => handleConfigChange('notificacionesVencimiento', checked)}
                        />
                      </div>
                    </div>
                    

                  </div>
                </PopoverContent>
              </Popover>

              {/* Ver todas */}
              {notificaciones.length > 5 && (
                <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[600px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Todas las Notificaciones ({notificaciones.length})
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 p-4">
                        {notificaciones.map((notificacion) => (
                          <NotificacionItem
                            key={notificacion.id}
                            notificacion={notificacion}
                            onMarcarLeida={marcarComoLeida}
                            onEliminar={eliminarNotificacion}
                            variant="full"
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <BellRing className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando notificaciones...</span>
            </div>
          ) : notificacionesRecientes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Sin notificaciones</h3>
              <p className="text-muted-foreground">No hay notificaciones recientes.</p>
              

            </div>
          ) : (
            <div className="space-y-3">
              {notificacionesRecientes.map((notificacion) => (
                <NotificacionItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onMarcarLeida={marcarComoLeida}
                  onEliminar={eliminarNotificacion}
                  variant="compact"
                />
              ))}
              
              {/* Acciones globales */}
              <div className="pt-4 border-t flex justify-between items-center">
                {notificacionesNoLeidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={marcarTodasComoLeidas}
                    className="text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Marcar todas como leídas
                  </Button>
                )}
                
                {notificaciones.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllNotifications(true)}
                    className="text-xs"
                  >
                    Ver todas ({notificaciones.length})
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Indicador de estado en vivo */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </Card>
    </>
  );
}

// Componente para cada notificación individual
interface NotificacionItemProps {
  notificacion: any;
  onMarcarLeida: (id: string) => void;
  onEliminar: (id: string) => void;
  variant: 'compact' | 'full';
}

function NotificacionItem({ notificacion, onMarcarLeida, onEliminar, variant }: NotificacionItemProps) {
  const [showActions, setShowActions] = useState(false);

  const getIconoTipo = (tipo: string, esUrgente: boolean) => {
    const baseClass = "h-4 w-4";
    
    switch (tipo) {
      case 'asignacion_recibida':
        return <User className={`${baseClass} text-blue-600`} />;
      case 'cambio_estado':
        return <Activity className={`${baseClass} text-orange-600`} />;
      case 'actividad_completada':
        return <CheckCircle2 className={`${baseClass} text-green-600`} />;
      case 'actividad_vencida':
        return <AlertTriangle className={`${baseClass} text-red-600`} />;
      default:
        return <Bell className={`${baseClass} text-gray-600`} />;
    }
  };

  const getColorFondo = (tipo: string, esUrgente: boolean) => {
    if (esUrgente) return 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200';
    
    switch (tipo) {
      case 'asignacion_recibida':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
      case 'cambio_estado':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200';
      case 'actividad_completada':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'actividad_vencida':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    }
  };

  return (
    <div
      className={`border rounded-lg transition-all duration-200 ${
        getColorFondo(notificacion.tipo, notificacion.esUrgente)
      } ${
        notificacion.leida ? 'opacity-60' : 'opacity-100'
      } ${
        variant === 'compact' ? 'p-3' : 'p-4'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {getIconoTipo(notificacion.tipo, notificacion.esUrgente)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {notificacion.titulo}
              </h4>
              {notificacion.esUrgente && (
                <Badge variant="destructive" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Urgente
                </Badge>
              )}
            </div>
            
            <p className={`text-gray-600 leading-relaxed ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
              {notificacion.mensaje}
            </p>
            
            {/* Metadata adicional */}
            {variant === 'full' && notificacion.metadata && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-4">
                  <span>📋 {notificacion.metadata.ruc}</span>
                  <span>📝 {notificacion.metadata.tipoActividad}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Vence: {format(new Date(notificacion.metadata.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}</span>
                </div>
              </div>
            )}
            
            {/* Usuario origen */}
            {notificacion.usuarioOrigen && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>Por: {notificacion.usuarioOrigen.nombre}</span>
              </div>
            )}
            
            {/* Timestamp */}
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {format(notificacion.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className={`flex items-center gap-1 ml-2 transition-opacity duration-200 ${
          showActions || variant === 'full' ? 'opacity-100' : 'opacity-0'
        }`}>
          {!notificacion.leida && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarcarLeida(notificacion.id)}
              className="h-6 w-6 p-0"
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEliminar(notificacion.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}