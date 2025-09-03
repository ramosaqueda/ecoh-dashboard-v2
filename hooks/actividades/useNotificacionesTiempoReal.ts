'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Interfaces para tipado
interface Actividad {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaTermino: string;
  observacion?: string;
  updatedAt?: string;
  createdAt: string;
  usuario: {
    id: number;
    nombre?: string;
    email: string;
  };
  usuarioAsignado?: {
    id: number;
    nombre?: string;
    email: string;
  };
  causa: {
    ruc: string;
  };
  tipoActividad: {
    nombre: string;
  };
}

interface NotificacionTiempoReal {
  id: string;
  tipo: 'asignacion_recibida' | 'cambio_estado' | 'actividad_completada' | 'actividad_vencida' | 'recordatorio';
  titulo: string;
  mensaje: string;
  fechaCreacion: Date;
  actividadId: number;
  usuarioOrigen?: {
    id: number;
    nombre: string;
    email: string;
  };
  usuarioDestino?: {
    id: number;
    nombre: string;
    email: string;
  };
  estadoAnterior?: string;
  estadoNuevo?: string;
  esUrgente: boolean;
  leida: boolean;
  metadata?: {
    ruc: string;
    tipoActividad: string;
    fechaVencimiento: string;
  };
}

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface UseNotificacionesTiempoReal {
  notificaciones: NotificacionTiempoReal[];
  notificacionesNoLeidas: number;
  isLoading: boolean;
  ordenAscendente: boolean;
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  cambiarOrden: () => void;
  forzarActualizacion: () => Promise<void>;
}

export const useNotificacionesTiempoReal = (): UseNotificacionesTiempoReal => {
  const [notificaciones, setNotificaciones] = useState<NotificacionTiempoReal[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actividadesConocidas, setActividadesConocidas] = useState<Set<number>>(new Set());
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  
  // 🆕 NUEVO: Estado para tracking de cambios de estado
  const [estadosActividades, setEstadosActividades] = useState<Map<number, {
    estado: string;
    fechaActualizacion: Date;
  }>>(new Map());
  
  const isMonitoringActive = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inicializado = useRef(false);
  const instanceId = useRef(Math.random().toString(36).substr(2, 6));

  const monitorearActividades = useCallback(async () => {
    if (!currentUser || isMonitoringActive.current) {
      return;
    }

    isMonitoringActive.current = true;
    const inicio = Date.now();
    
   
    try {
      const params = new URLSearchParams({
        limit: '400',
        include_assigned: 'true',
        page: '1'
      });

      const response = await fetch(`/api/actividades?${params.toString()}`);
      if (!response.ok) {
        console.error(`❌ [HOOK-${instanceId.current}] Error API:`, response.status);
        return;
      }
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      console.log(`📊 [HOOK-${instanceId.current}] API retornó ${data.length} actividades`);

      const nuevasNotificaciones: NotificacionTiempoReal[] = [];
      const actividadesVistas = new Set<number>();
      const estadosActuales = new Map<number, { estado: string; fechaActualizacion: Date }>();
      const ahora = new Date();

      // Filtros con tipado mejorado
      const actividadesAsignadasAMi = data.filter((a: Actividad) => {
        const esAsignadaAMi = a.usuarioAsignado?.id === currentUser.id;
        const noSoyCreador = a.usuario?.id !== currentUser.id;
        return esAsignadaAMi && noSoyCreador;
      });

      console.log(`🎯 [HOOK-${instanceId.current}] Asignaciones a mí: ${actividadesAsignadasAMi.length}`);

      for (const actividad of actividadesAsignadasAMi) {
        const actividadId = actividad.id;
        const esNuevaActividad = !actividadesConocidas.has(actividadId);
        
        if (esNuevaActividad) {
          const fechaCreacion = new Date(actividad.fechaInicio);
          
          if (!inicializado.current) {
            const minutosDesdeCreacion = (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60);
            if (minutosDesdeCreacion > 30) {
              actividadesVistas.add(actividadId);
              estadosActuales.set(actividadId, { estado: actividad.estado, fechaActualizacion: new Date(actividad.updatedAt) });
              continue;
            }
          }

          console.log(`🎉 [HOOK-${instanceId.current}] Nueva asignación detectada: ${actividadId}`);
          
          const diasParaVencer = Math.ceil((new Date(actividad.fechaTermino).getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000));

          nuevasNotificaciones.push({
            id: `asignacion-${actividadId}-${Date.now()}-${instanceId.current}`,
            tipo: 'asignacion_recibida',
            titulo: '🔔 Nueva Actividad Asignada',
            mensaje: `${actividad.usuario?.nombre || actividad.usuario?.email} te asignó "${actividad.tipoActividad?.nombre}" para la causa ${actividad.causa?.ruc}\n\n Detalle actividad:  ${actividad.observacion || 'Sin observaciones adicionales'}`,
            fechaCreacion: ahora,
            actividadId,
            usuarioOrigen: {
              id: actividad.usuario.id,
              nombre: actividad.usuario.nombre || actividad.usuario.email,
              email: actividad.usuario.email
            },
            usuarioDestino: {
              id: actividad.usuarioAsignado.id,
              nombre: actividad.usuarioAsignado.nombre || actividad.usuarioAsignado.email,
              email: actividad.usuarioAsignado.email
            },
            esUrgente: diasParaVencer <= 3,
            leida: false,
            metadata: {
              ruc: actividad.causa?.ruc || 'N/A',
              tipoActividad: actividad.tipoActividad?.nombre || 'Sin tipo',
              fechaVencimiento: actividad.fechaTermino
            }
          });
        }

        actividadesVistas.add(actividadId);
        estadosActuales.set(actividadId, { 
          estado: actividad.estado, 
          fechaActualizacion: new Date(actividad.updatedAt || actividad.createdAt) 
        });
      }

      // 🆕 PASO 2: DETECTAR CAMBIOS DE ESTADO EN ACTIVIDADES QUE YO ASIGNÉ
      console.log(`🔄 [HOOK-${instanceId.current}] === DETECTANDO CAMBIOS DE ESTADO ===`);
      
      const actividadesAsignadasPorMi = data.filter((a: Actividad) => {
        const esAsignadaPorMi = a.usuario?.id === currentUser.id;
        const tieneAsignado = a.usuarioAsignado?.id && a.usuarioAsignado?.id !== currentUser.id;
        return esAsignadaPorMi && tieneAsignado;
      });

      console.log(`👥 [HOOK-${instanceId.current}] Actividades que yo asigné: ${actividadesAsignadasPorMi.length}`);

      for (const actividad of actividadesAsignadasPorMi) {
        const actividadId = actividad.id;
        const estadoActual = actividad.estado;
        const fechaActualizacion = new Date(actividad.updatedAt || actividad.createdAt);
        
        // Obtener estado anterior conocido
        const estadoAnteriorData = estadosActividades.get(actividadId);
        
        console.log(`📋 [HOOK-${instanceId.current}] Actividad que asigné - ID ${actividadId}:`);
        console.log(`   👤 Asignada a: ${actividad.usuarioAsignado?.email}`);
        console.log(`   📝 Tipo: ${actividad.tipoActividad?.nombre}`);
        console.log(`   🔄 Estado actual: ${estadoActual}`);
        console.log(`   🔄 Estado anterior conocido: ${estadoAnteriorData?.estado || 'Desconocido'}`);
        console.log(`   📅 Última actualización: ${fechaActualizacion.toISOString()}`);

        // 🎯 DETECTAR CAMBIO DE ESTADO
        if (estadoAnteriorData && estadoAnteriorData.estado !== estadoActual) {
          // Verificar que la actualización sea realmente nueva
          const esActualizacionNueva = fechaActualizacion > estadoAnteriorData.fechaActualizacion;
          
          if (esActualizacionNueva) {
            console.log(`🎉 [HOOK-${instanceId.current}] *** CAMBIO DE ESTADO DETECTADO ***`);
            console.log(`   De: "${estadoAnteriorData.estado}" → A: "${estadoActual}"`);
            console.log(`   Por: ${actividad.usuarioAsignado?.email}`);
            
            // Determinar tipo de notificación según el nuevo estado
            let tipoNotificacion: 'cambio_estado' | 'actividad_completada' = 'cambio_estado';
            let titulo = '🔄 Estado de Actividad Actualizado';
            let esUrgente = false;
            
            if (estadoActual === 'terminado') {
              tipoNotificacion = 'actividad_completada';
              titulo = '✅ Actividad Completada';
              esUrgente = true; // Las completadas son importantes
            }

            const nuevaNotificacion: NotificacionTiempoReal = {
              id: `cambio-estado-${actividadId}-${Date.now()}-${instanceId.current}`,
              tipo: tipoNotificacion,
              titulo,
              mensaje: `${actividad.usuarioAsignado?.nombre || actividad.usuarioAsignado?.email} cambió el estado de "${actividad.tipoActividad?.nombre}" de "${estadoAnteriorData.estado}" a "${estadoActual}"`,
              fechaCreacion: ahora,
              actividadId,
              usuarioOrigen: {
                id: actividad.usuarioAsignado.id,
                nombre: actividad.usuarioAsignado.nombre || actividad.usuarioAsignado.email,
                email: actividad.usuarioAsignado.email
              },
              usuarioDestino: {
                id: actividad.usuario.id,
                nombre: actividad.usuario.nombre || actividad.usuario.email,
                email: actividad.usuario.email
              },
              estadoAnterior: estadoAnteriorData.estado,
              estadoNuevo: estadoActual,
              esUrgente,
              leida: false,
              metadata: {
                ruc: actividad.causa?.ruc || 'N/A',
                tipoActividad: actividad.tipoActividad?.nombre || 'Sin tipo',
                fechaVencimiento: actividad.fechaTermino
              }
            };

            nuevasNotificaciones.push(nuevaNotificacion);
            console.log(`   ✅ [HOOK-${instanceId.current}] Notificación de cambio creada: ${nuevaNotificacion.id}`);
          } else {
            console.log(`   ℹ️ [HOOK-${instanceId.current}] Cambio de estado ya conocido (fecha antigua)`);
          }
        } else if (!estadoAnteriorData) {
          console.log(`   📝 [HOOK-${instanceId.current}] Primera vez viendo esta actividad, guardando estado inicial`);
        }

        // Actualizar estado conocido
        estadosActuales.set(actividadId, { 
          estado: estadoActual, 
          fechaActualizacion 
        });
        actividadesVistas.add(actividadId);
      }

      // 🚨 PASO 3: DETECTAR ACTIVIDADES VENCIDAS (ya funciona)
      const actividadesVencidas = actividadesAsignadasAMi.filter((a: Actividad) => {
        const esVencida = new Date(a.fechaTermino) < ahora && a.estado !== 'terminado';
        const noNotificadaAntes = !actividadesConocidas.has(a.id);
        return esVencida && noNotificadaAntes;
      });

      actividadesVencidas.forEach((actividad: Actividad) => {
        console.log(`⚠️ [HOOK-${instanceId.current}] Actividad vencida: ${actividad.id}`);
        nuevasNotificaciones.push({
          id: `vencida-${actividad.id}-${Date.now()}`,
          tipo: 'actividad_vencida',
          titulo: '⚠️ Actividad Vencida',
          mensaje: `La actividad "${actividad.tipoActividad?.nombre}" en causa ${actividad.causa?.ruc} está vencida`,
          fechaCreacion: ahora,
          actividadId: actividad.id,
          esUrgente: true,
          leida: false,
          metadata: {
            ruc: actividad.causa?.ruc || 'N/A',
            tipoActividad: actividad.tipoActividad?.nombre || 'Sin tipo',
            fechaVencimiento: actividad.fechaTermino
          }
        });
      });

      // 🔄 ACTUALIZAR ESTADOS
      console.log(`📊 [HOOK-${instanceId.current}] Actualizando tracking...`);
      console.log(`   Actividades conocidas: ${actividadesConocidas.size} → ${actividadesVistas.size}`);
      console.log(`   Estados de actividades: ${estadosActividades.size} → ${estadosActuales.size}`);
      
      setActividadesConocidas(actividadesVistas);
      setEstadosActividades(estadosActuales);
      
      if (nuevasNotificaciones.length > 0) {
        console.log(`🔔 [HOOK-${instanceId.current}] *** AGREGANDO ${nuevasNotificaciones.length} NOTIFICACIONES ***`);
        nuevasNotificaciones.forEach((n, i) => console.log(`   ${i+1}. ${n.tipo}: ${n.titulo} (Act #${n.actividadId})`));
        
        setNotificaciones(prev => {
          const actualizadas = [...nuevasNotificaciones, ...prev].slice(0, 100);
          console.log(`📊 [HOOK-${instanceId.current}] Total después: ${actualizadas.length}`);
          return actualizadas;
        });
      } else {
        console.log(`ℹ️ [HOOK-${instanceId.current}] No hay nuevas notificaciones en este ciclo`);
      }

      if (!inicializado.current) {
        inicializado.current = true;
        console.log(`🚀 [HOOK-${instanceId.current}] Sistema inicializado y tracking activo`);
      }

    } catch (error) {
      console.error(`💥 [HOOK-${instanceId.current}] Error:`, error);
    } finally {
      isMonitoringActive.current = false;
      console.log(`⏱️ [HOOK-${instanceId.current}] Monitoreo completado en ${Date.now() - inicio}ms`);
      console.log('='.repeat(70));
    }
  }, [currentUser, actividadesConocidas, estadosActividades]);

  // Inicialización
  useEffect(() => {
    const inicializar = async () => {
      console.log(`🚀 [HOOK-${instanceId.current}] ===== INICIALIZANDO HOOK v4.0 =====`);
      
      try {
        const response = await fetch('/api/usuarios/me');
        if (!response.ok) throw new Error('Error al obtener usuario');
        
        const userData = await response.json();
        const userWithRole = await fetch(`/api/usuarios?roles=${userData.rolId || 3}`);
        
        let finalUser = null;
        if (userWithRole.ok) {
          const usersData = await userWithRole.json();
          finalUser = usersData.find((u: Usuario) => u.id === userData.id);
        }
        
        if (!finalUser) {
          finalUser = {
            id: userData.id,
            email: userData.email,
            nombre: userData.nombre || userData.email,
            rol: { id: userData.rolId || 3, nombre: 'Usuario' }
          };
        }
        
        console.log(`✅ [HOOK-${instanceId.current}] Usuario configurado:`, finalUser.email);
        setCurrentUser(finalUser);
        setIsLoading(false);
        
      } catch (error) {
        console.error(`❌ [HOOK-${instanceId.current}] Error en inicialización:`, error);
        setIsLoading(false);
      }
    };
    
    inicializar();
  }, []);

  // Polling
  useEffect(() => {
    if (!currentUser || isLoading) {
      return;
    }

    console.log(`⏰ [HOOK-${instanceId.current}] Configurando polling cada 8 segundos...`);
    
    const timeoutId = setTimeout(() => {
      console.log(`🚀 [HOOK-${instanceId.current}] Primera verificación...`);
      monitorearActividades();
    }, 3000);
    
    intervalRef.current = setInterval(() => {
      console.log(`🔄 [HOOK-${instanceId.current}] Verificación automática...`);
      monitorearActividades();
    }, 8000);
    
    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log(`🛑 [HOOK-${instanceId.current}] Polling detenido`);
    };
  }, [currentUser, isLoading, monitorearActividades]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      console.log(`🧹 [HOOK-${instanceId.current}] Hook cleanup completado`);
    };
  }, []);

  // Funciones de control
  const marcarComoLeida = useCallback((id: string) => {
    console.log(`👁️ [HOOK-${instanceId.current}] Marcando como leída: ${id}`);
    setNotificaciones(prev => prev.map((notif: NotificacionTiempoReal) => 
      notif.id === id ? { ...notif, leida: true } : notif
    ));
  }, []);

  const marcarTodasComoLeidas = useCallback(() => {
    console.log(`👁️ [HOOK-${instanceId.current}] Marcando todas como leídas`);
    setNotificaciones(prev => prev.map((notif: NotificacionTiempoReal) => ({ ...notif, leida: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  }, []);

  const eliminarNotificacion = useCallback((id: string) => {
    console.log(`🗑️ [HOOK-${instanceId.current}] Eliminando: ${id}`);
    setNotificaciones(prev => prev.filter((notif: NotificacionTiempoReal) => notif.id !== id));
  }, []);

  const cambiarOrden = useCallback(() => {
    setOrdenAscendente(prev => {
      const nuevoOrden = !prev;
      console.log(`🔄 [HOOK-${instanceId.current}] Orden cambiado a:`, nuevoOrden ? 'Ascendente' : 'Descendente');
      return nuevoOrden;
    });
  }, []);

  const forzarActualizacion = useCallback(async () => {
    console.log(`🔄 [HOOK-${instanceId.current}] === FORZANDO ACTUALIZACIÓN ===`);
    if (!isMonitoringActive.current) {
      await monitorearActividades();
    }
  }, [monitorearActividades]);

  // Re-ordenar cuando cambia el orden
  useEffect(() => {
    setNotificaciones(prev => [...prev].sort((a: NotificacionTiempoReal, b: NotificacionTiempoReal) => {
      return ordenAscendente 
        ? a.fechaCreacion.getTime() - b.fechaCreacion.getTime()
        : b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
    }));
  }, [ordenAscendente]);

  const notificacionesNoLeidas = notificaciones.filter((n: NotificacionTiempoReal) => !n.leida).length;

  // Log del estado cuando hay cambios importantes
  useEffect(() => {
    if (notificaciones.length > 0) {
      const estadisticas = {
        total: notificaciones.length,
        noLeidas: notificacionesNoLeidas,
        asignaciones: notificaciones.filter((n: NotificacionTiempoReal) => n.tipo === 'asignacion_recibida').length,
        cambiosEstado: notificaciones.filter((n: NotificacionTiempoReal) => n.tipo === 'cambio_estado').length,
        completadas: notificaciones.filter((n: NotificacionTiempoReal) => n.tipo === 'actividad_completada').length,
        vencidas: notificaciones.filter((n: NotificacionTiempoReal) => n.tipo === 'actividad_vencida').length
      };
      
      console.log(`📊 [HOOK-${instanceId.current}] Estado v4.0:`, estadisticas);
    }
  }, [notificaciones.length]);

  return {
    notificaciones,
    notificacionesNoLeidas,
    isLoading,
    ordenAscendente,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    cambiarOrden,
    forzarActualizacion
  };
};
