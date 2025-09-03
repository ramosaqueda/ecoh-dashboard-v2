'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Wifi,
  WifiOff,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EstadoSistema {
  conexionAPI: 'conectado' | 'desconectado' | 'lento';
  ultimaActualizacion: Date;
  actividadesMonitoreadas: number;
  notificacionesEnviadas: number;
  erroresRecientes: number;
  rendimiento: 'excelente' | 'bueno' | 'regular' | 'degradado';
}

interface MonitorEstadosProps {
  posicion?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  mostrarDetalles?: boolean;
}

export default function MonitorEstadosSistema({ 
  posicion = 'bottom-right', 
  mostrarDetalles = false 
}: MonitorEstadosProps) {
  const [estadoSistema, setEstadoSistema] = useState<EstadoSistema>({
    conexionAPI: 'conectado',
    ultimaActualizacion: new Date(),
    actividadesMonitoreadas: 0,
    notificacionesEnviadas: 0,
    erroresRecientes: 0,
    rendimiento: 'excelente'
  });

  const [isExpanded, setIsExpanded] = useState(mostrarDetalles);
  const [tiempoConexion, setTiempoConexion] = useState(0);

  // Verificar estado de la API
  const verificarEstadoAPI = async () => {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/actividades?limit=1');
      const endTime = performance.now();
      const tiempoRespuesta = endTime - startTime;
      
      let conexionStatus: 'conectado' | 'desconectado' | 'lento' = 'conectado';
      let rendimiento: 'excelente' | 'bueno' | 'regular' | 'degradado' = 'excelente';
      
      if (!response.ok) {
        conexionStatus = 'desconectado';
        rendimiento = 'degradado';
      } else if (tiempoRespuesta > 2000) {
        conexionStatus = 'lento';
        rendimiento = 'regular';
      } else if (tiempoRespuesta > 1000) {
        rendimiento = 'bueno';
      }

      setEstadoSistema(prev => ({
        ...prev,
        conexionAPI: conexionStatus,
        ultimaActualizacion: new Date(),
        rendimiento,
        erroresRecientes: conexionStatus === 'desconectado' ? prev.erroresRecientes + 1 : Math.max(0, prev.erroresRecientes - 1)
      }));

      return true;
    } catch (error) {
      setEstadoSistema(prev => ({
        ...prev,
        conexionAPI: 'desconectado',
        ultimaActualizacion: new Date(),
        rendimiento: 'degradado',
        erroresRecientes: prev.erroresRecientes + 1
      }));
      return false;
    }
  };

  // Simular actualización de métricas
  const actualizarMetricas = () => {
    setEstadoSistema(prev => ({
      ...prev,
      actividadesMonitoreadas: Math.floor(Math.random() * 100) + 50,
      notificacionesEnviadas: prev.notificacionesEnviadas + Math.floor(Math.random() * 3)
    }));
  };

  // Inicializar monitoreo
  useEffect(() => {
    verificarEstadoAPI();
    
    // Verificar estado cada 30 segundos
    const intervalVerificacion = setInterval(verificarEstadoAPI, 30000);
    
    // Actualizar métricas cada 10 segundos
    const intervalMetricas = setInterval(actualizarMetricas, 10000);
    
    // Contador de tiempo de conexión
    const intervalTiempo = setInterval(() => {
      setTiempoConexion(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalVerificacion);
      clearInterval(intervalMetricas);
      clearInterval(intervalTiempo);
    };
  }, []);

  // Obtener clases CSS según posición
  const getPosicionClasses = () => {
    const base = "fixed z-50";
    switch (posicion) {
      case 'bottom-right': return `${base} bottom-4 right-4`;
      case 'bottom-left': return `${base} bottom-4 left-4`;
      case 'top-right': return `${base} top-4 right-4`;
      case 'top-left': return `${base} top-4 left-4`;
      default: return `${base} bottom-4 right-4`;
    }
  };

  // Obtener icono de conexión
  const getIconoConexion = () => {
    switch (estadoSistema.conexionAPI) {
      case 'conectado':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'lento':
        return <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'desconectado':
        return <WifiOff className="h-4 w-4 text-red-600 animate-bounce" />;
    }
  };

  // Obtener color del indicador
  const getColorIndicador = () => {
    switch (estadoSistema.rendimiento) {
      case 'excelente': return 'bg-green-500';
      case 'bueno': return 'bg-blue-500';
      case 'regular': return 'bg-yellow-500';
      case 'degradado': return 'bg-red-500';
    }
  };

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={getPosicionClasses()}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg ${
                isExpanded ? 'w-80' : 'w-auto'
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <CardContent className="p-3">
                {!isExpanded ? (
                  // Vista compacta
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${getColorIndicador()}`}></div>
                    {getIconoConexion()}
                    <span className="text-xs font-medium">Sistema</span>
                    {estadoSistema.erroresRecientes > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {estadoSistema.erroresRecientes}
                      </Badge>
                    )}
                  </div>
                ) : (
                  // Vista expandida
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Monitor del Sistema
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          verificarEstadoAPI();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Estado de conexión */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Conexión API:</span>
                        <div className="flex items-center gap-1">
                          {getIconoConexion()}
                          <span className={`text-xs font-medium ${
                            estadoSistema.conexionAPI === 'conectado' ? 'text-green-600' :
                            estadoSistema.conexionAPI === 'lento' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {estadoSistema.conexionAPI.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Rendimiento:</span>
                        <Badge 
                          variant={estadoSistema.rendimiento === 'excelente' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {estadoSistema.rendimiento.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Tiempo Activo:</span>
                        <span className="text-xs font-mono">{formatearTiempo(tiempoConexion)}</span>
                      </div>
                    </div>
                    
                    {/* Métricas de actividad */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3 text-blue-600" />
                          <span>{estadoSistema.actividadesMonitoreadas} monitoreadas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bell className="h-3 w-3 text-purple-600" />
                          <span>{estadoSistema.notificacionesEnviadas} enviadas</span>
                        </div>
                      </div>
                      
                      {estadoSistema.erroresRecientes > 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{estadoSistema.erroresRecientes} errores recientes</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Última actualización */}
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      Última verificación: {estadoSistema.ultimaActualizacion.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          
          {!isExpanded && (
            <TooltipContent side="top">
              <div className="text-xs space-y-1">
                <div>Estado del Sistema: <strong>{estadoSistema.rendimiento}</strong></div>
                <div>Conexión: <strong>{estadoSistema.conexionAPI}</strong></div>
                <div>Monitoreando: <strong>{estadoSistema.actividadesMonitoreadas}</strong> actividades</div>
                <div>Click para expandir</div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}