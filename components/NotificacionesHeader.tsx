'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  BellRing,
  X,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  Zap,
  Activity,
  Settings,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificacionesTiempoReal } from '@/hooks/actividades';

export default function NotificacionesHeader() {
  const {
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  } = useNotificacionesTiempoReal();

  const [isOpen, setIsOpen] = useState(false);

  // Obtener icono según tipo de notificación
  const getIconoTipo = (tipo: string, esUrgente: boolean) => {
    const baseClass = "h-3 w-3";
    
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

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <BellRing className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notificacionesNoLeidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header del popover */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-sm">Notificaciones</h4>
            {notificacionesNoLeidas > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notificacionesNoLeidas}
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notificacionesNoLeidas > 0 && (
                <DropdownMenuItem onClick={marcarTodasComoLeidas}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Configurar notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lista de notificaciones */}
        {notificaciones.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Sin notificaciones</p>
            <p className="text-xs text-muted-foreground">Te avisaremos cuando tengas nuevas actividades</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-2">
              {notificaciones.slice(0, 10).map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`border rounded-lg mb-2 transition-all duration-200 ${
                    getColorFondo(notificacion.tipo, notificacion.esUrgente)
                  } ${
                    notificacion.leida ? 'opacity-60' : 'opacity-100'
                  } p-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconoTipo(notificacion.tipo, notificacion.esUrgente)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h5 className="font-medium text-xs truncate">
                            {notificacion.titulo}
                          </h5>
                          {notificacion.esUrgente && (
                            <Zap className="h-3 w-3 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {notificacion.mensaje}
                        </p>
                        
                        {/* Usuario origen */}
                        {notificacion.usuarioOrigen && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <User className="h-2 w-2" />
                            <span>De: {notificacion.usuarioOrigen.nombre}</span>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-2 w-2" />
                          <span>
                            {format(notificacion.fechaCreacion, 'dd/MM HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-1 ml-2">
                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLeida(notificacion.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notificacion.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {notificaciones.length > 10 && (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    Mostrando las 10 notificaciones más recientes de {notificaciones.length}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Footer con estadísticas */}
        {notificaciones.length > 0 && (
          <div className="border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total: {notificaciones.length}</span>
              {notificacionesNoLeidas > 0 && (
                <span className="text-orange-600 font-medium">
                  {notificacionesNoLeidas} sin leer
                </span>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}