'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CambioDetectado {
  actividadId: number;
  tipo: 'nueva_asignacion' | 'cambio_estado' | 'actividad_completada' | 'nueva_vencida';
  usuarioAfectado: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  timestamp: Date;
  metadata: {
    ruc: string;
    tipoActividad: string;
    usuarioAsignado?: string;
    fechaVencimiento: string;
  };
}

interface DetectorCambiosProps {
  onCambioDetectado?: (cambios: CambioDetectado[]) => void;
  intervalo?: number; // segundos
  activo?: boolean;
}

interface ActividadSnapshot {
  id: number;
  estado: string;
  usuarioAsignado?: number;
  fechaTermino: string;
  ruc: string;
  tipoActividad: string;
  lastCheck: Date;
}

export default function DetectorCambiosActividades({ 
  onCambioDetectado, 
  intervalo = 30, 
  activo = true 
}: DetectorCambiosProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [ultimaVerificacion, setUltimaVerificacion] = useState<Date | null>(null);
  const snapshotAnterior = useRef<Map<number, ActividadSnapshot>>(new Map());
  const currentUser = useRef<any>(null);

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (!response.ok) throw new Error('Error al obtener usuario');
      
      const userData = await response.json();
      currentUser.current = userData;
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  };

  // Obtener snapshot actual de actividades
  const obtenerSnapshotActividades = async (): Promise<Map<number, ActividadSnapshot>> => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('include_assigned', 'true');
      
      const response = await fetch(`/api/actividades?${params.toString()}`);
      if (!response.ok) throw new Error('Error al obtener actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      const snapshot = new Map<number, ActividadSnapshot>();
      
      data.forEach((actividad: any) => {
        snapshot.set(actividad.id, {
          id: actividad.id,
          estado: actividad.estado,
          usuarioAsignado: actividad.usuarioAsignado?.id,
          fechaTermino: actividad.fechaTermino,
          ruc: actividad.causa.ruc,
          tipoActividad: actividad.tipoActividad.nombre,
          lastCheck: new Date()
        });
      });
      
      return snapshot;
    } catch (error) {
      console.error('Error al obtener snapshot:', error);
      return new Map();
    }
  };

  // Detectar cambios entre snapshots
  const detectarCambios = (
    snapshotAnterior: Map<number, ActividadSnapshot>,
    snapshotActual: Map<number, ActividadSnapshot>
  ): CambioDetectado[] => {
    const cambios: CambioDetectado[] = [];
    const usuario = currentUser.current;
    
    if (!usuario) return cambios;

    snapshotActual.forEach((actual, actividadId) => {
      const anterior = snapshotAnterior.get(actividadId);
      
      // Nueva actividad detectada
      if (!anterior) {
        // Verificar si es una nueva asignación para el usuario actual
        if (actual.usuarioAsignado === usuario.id) {
          cambios.push({
            actividadId,
            tipo: 'nueva_asignacion',
            usuarioAfectado: usuario.id,
            timestamp: new Date(),
            metadata: {
              ruc: actual.ruc,
              tipoActividad: actual.tipoActividad,
              fechaVencimiento: actual.fechaTermino
            }
          });
        }
        return;
      }

      // Cambio de estado detectado
      if (anterior.estado !== actual.estado) {
        const esCompletada = actual.estado === 'terminado';
        
        cambios.push({
          actividadId,
          tipo: esCompletada ? 'actividad_completada' : 'cambio_estado',
          usuarioAfectado: actual.usuarioAsignado || usuario.id,
          estadoAnterior: anterior.estado,
          estadoNuevo: actual.estado,
          timestamp: new Date(),
          metadata: {
            ruc: actual.ruc,
            tipoActividad: actual.tipoActividad,
            usuarioAsignado: actual.usuarioAsignado?.toString(),
            fechaVencimiento: actual.fechaTermino
          }
        });
      }

      // Cambio de asignación detectado
      if (anterior.usuarioAsignado !== actual.usuarioAsignado) {
        if (actual.usuarioAsignado === usuario.id) {
          cambios.push({
            actividadId,
            tipo: 'nueva_asignacion',
            usuarioAfectado: usuario.id,
            timestamp: new Date(),
            metadata: {
              ruc: actual.ruc,
              tipoActividad: actual.tipoActividad,
              fechaVencimiento: actual.fechaTermino
            }
          });
        }
      }

      // Actividad vencida detectada
      const esVencida = new Date(actual.fechaTermino) < new Date() && actual.estado !== 'terminado';
      const eraVencidaAntes = new Date(anterior.fechaTermino) < anterior.lastCheck && anterior.estado !== 'terminado';
      
      if (esVencida && !eraVencidaAntes && actual.usuarioAsignado === usuario.id) {
        cambios.push({
          actividadId,
          tipo: 'nueva_vencida',
          usuarioAfectado: usuario.id,
          timestamp: new Date(),
          metadata: {
            ruc: actual.ruc,
            tipoActividad: actual.tipoActividad,
            fechaVencimiento: actual.fechaTermino
          }
        });
      }
    });

    return cambios;
  };

  // Proceso de monitoreo principal
  const verificarCambios = async () => {
    if (!activo || !currentUser.current) return;

    setIsMonitoring(true);
    
    try {
      const snapshotActual = await obtenerSnapshotActividades();
      const cambiosDetectados = detectarCambios(snapshotAnterior.current, snapshotActual);
      
      if (cambiosDetectados.length > 0) {
        console.log(`🔍 Detector: ${cambiosDetectados.length} cambios detectados`, cambiosDetectados);
        
        // Disparar notificaciones correspondientes
        cambiosDetectados.forEach(cambio => {
          switch (cambio.tipo) {
            case 'nueva_asignacion':
              toast.info('🔔 Nueva Actividad Asignada', {
                description: `Se te ha asignado "${cambio.metadata.tipoActividad}" en ${cambio.metadata.ruc}`,
                duration: 8000,
              });
              break;
              
            case 'cambio_estado':
              toast('🔄 Cambio de Estado', {
                description: `Actividad "${cambio.metadata.tipoActividad}" cambió de "${cambio.estadoAnterior}" a "${cambio.estadoNuevo}"`,
                duration: 6000,
              });
              break;
              
            case 'actividad_completada':
              toast.success('✅ Actividad Completada', {
                description: `Se completó "${cambio.metadata.tipoActividad}" en ${cambio.metadata.ruc}`,
                duration: 10000,
              });
              break;
              
            case 'nueva_vencida':
              toast.error('⚠️ Actividad Vencida', {
                description: `"${cambio.metadata.tipoActividad}" está vencida y requiere atención`,
                duration: 15000,
              });
              break;
          }
        });
        
        // Llamar callback si existe
        onCambioDetectado?.(cambiosDetectados);
      }
      
      // Actualizar snapshot para próxima verificación
      snapshotAnterior.current = snapshotActual;
      setUltimaVerificacion(new Date());
      
    } catch (error) {
      console.error('Error en verificación de cambios:', error);
    } finally {
      setIsMonitoring(false);
    }
  };

  // Inicializar detector
  useEffect(() => {
    if (activo) {
      fetchCurrentUser();
    }
  }, [activo]);

  // Configurar intervalo de monitoreo
  useEffect(() => {
    if (!activo || !currentUser.current) return;

    // Verificación inicial
    verificarCambios();

    // Configurar intervalo
    const intervalId = setInterval(verificarCambios, intervalo * 1000);

    return () => clearInterval(intervalId);
  }, [activo, intervalo]);

  // Este componente es invisible, solo ejecuta lógica en background
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Indicador visual discreto del estado del detector */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full shadow-lg text-xs">
        <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="text-muted-foreground">
          Detector {activo ? 'Activo' : 'Inactivo'}
        </span>
        {ultimaVerificacion && (
          <span className="text-xs text-gray-400">
            {ultimaVerificacion.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  );
}