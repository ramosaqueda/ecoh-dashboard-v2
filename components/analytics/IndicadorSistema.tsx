'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Wifi,
  WifiOff,
  Server,
  Database,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EstadoSistema {
  apiConectada: boolean;
  detectorActivo: boolean;
  ultimaVerificacion: Date;
  notificacionesEnviadas: number;
  cambiosDetectados: number;
  erroresRecientes: number;
}

interface IndicadorSistemaProps {
  posicion?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function IndicadorSistema({ posicion = 'bottom-right' }: IndicadorSistemaProps) {
  const [estado, setEstado] = useState<EstadoSistema>({
    apiConectada: true,
    detectorActivo: true,
    ultimaVerificacion: new Date(),
    notificacionesEnviadas: 0,
    cambiosDetectados: 0,
    erroresRecientes: 0
  });

  const [showDetails, setShowDetails] = useState(false);

  // Simular verificación de estado del sistema
  useEffect(() => {
    const verificarEstado = () => {
      setEstado(prev => ({
        ...prev,
        ultimaVerificacion: new Date(),
        notificacionesEnviadas: prev.notificacionesEnviadas + Math.floor(Math.random() * 2),
        cambiosDetectados: prev.cambiosDetectados + Math.floor(Math.random() * 3),
        apiConectada: Math.random() > 0.1, // 90% uptime
        detectorActivo: Math.random() > 0.05, // 95% uptime
        erroresRecientes: Math.random() > 0.8 ? prev.erroresRecientes + 1 : Math.max(0, prev.erroresRecientes - 1)
      }));
    };

    // Verificar estado cada 10 segundos
    const interval = setInterval(verificarEstado, 10000);
    return () => clearInterval(interval);
  }, []);

  // Obtener clases CSS según posición
  const getPosicionClasses = () => {
    const base = 'fixed z-50';
    switch (posicion) {
      case 'top-right': return `${base} top-4 right-4`;
      case 'bottom-right': return `${base} bottom-4 right-4`;
      case 'top-left': return `${base} top-4 left-4`;
      case 'bottom-left': return `${base} bottom-4 left-4`;
      default: return `${base} bottom-4 right-4`;
    }
  };

  // Determinar estado general del sistema
  const estadoGeneral = estado.apiConectada && estado.detectorActivo && estado.erroresRecientes < 3 
    ? 'saludable' 
    : estado.erroresRecientes >= 5 
      ? 'error' 
      : 'advertencia';

  const getIconoEstado = () => {
    switch (estadoGeneral) {
      case 'saludable': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'advertencia': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getColorFondo = () => {
    switch (estadoGeneral) {
      case 'saludable': return 'bg-green-50 border-green-200 text-green-800';
      case 'advertencia': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={getPosicionClasses()}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className={`${getColorFondo()} hover:opacity-80 transition-all duration-200`}
            >
              <div className="flex items-center gap-2">
                {getIconoEstado()}
                <span className="text-xs font-medium">Sistema RT</span>
                <div className={`w-2 h-2 rounded-full ${
                  estado.detectorActivo ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[300px]">
            <div className="space-y-2">
              <h4 className="font-medium">Sistema de Notificaciones</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${estado.apiConectada ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>API: {estado.apiConectada ? 'Conectada' : 'Desconectada'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${estado.detectorActivo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Detector: {estado.detectorActivo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="text-muted-foreground">
                  Última verificación: {estado.ultimaVerificacion.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Panel de detalles expandido */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Estado del Sistema RT</h4>
              <Badge variant={estadoGeneral === 'saludable' ? 'default' : 'destructive'}>
                {estadoGeneral === 'saludable' ? 'Saludable' : 
                 estadoGeneral === 'advertencia' ? 'Advertencia' : 'Error'}
              </Badge>
            </div>
            
            {/* Métricas del sistema */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-3 w-3 text-blue-600" />
                  <span>API Status</span>
                  <div className={`w-2 h-2 rounded-full ${estado.apiConectada ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-purple-600" />
                  <span>Detector</span>
                  <div className={`w-2 h-2 rounded-full ${estado.detectorActivo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3 text-orange-600" />
                  <span>Enviadas: {estado.notificacionesEnviadas}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-green-600" />
                  <span>Cambios: {estado.cambiosDetectados}</span>
                </div>
              </div>
            </div>
            
            {/* Errores recientes */}
            {estado.erroresRecientes > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-xs">
                    {estado.erroresRecientes} error{estado.erroresRecientes > 1 ? 'es' : ''} reciente{estado.erroresRecientes > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            
            {/* Estado de conexión */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Última verificación:</span>
                <span>{estado.ultimaVerificacion.toLocaleTimeString('es-ES')}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Próxima verificación:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>30s</span>
                </div>
              </div>
            </div>
            
            {/* Acciones rápidas */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEstado(prev => ({ ...prev, ultimaVerificacion: new Date() }));
                  console.log('Verificación manual del sistema');
                }}
                className="flex-1 text-xs"
              >
                <Activity className="h-3 w-3 mr-1" />
                Verificar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="text-xs"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}