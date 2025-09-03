'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
    denominacionCausa: string;
  };
  tipoActividad: {
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  observacion?: string;
  glosa_cierre?: string;
  createdAt?: string;
  updatedAt?: string;
  usuario?: {
    id: number;
    email?: string;
    nombre?: string;
  };
  usuarioAsignado?: {
    id: number;
    email?: string;
    nombre?: string;
    rol?: {
      nombre: string;
    };
  };
}

interface ActividadesStats {
  total: number;
  completadas: number;
  pendientes: number;
  vencidas: number;
  proximasVencer: number;
  misPendientes: number;
  misAsignadas: number;
  porcentajeCompletado: number;
}

export const useActividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ActividadesStats>({
    total: 0,
    completadas: 0,
    pendientes: 0,
    vencidas: 0,
    proximasVencer: 0,
    misPendientes: 0,
    misAsignadas: 0,
    porcentajeCompletado: 0
  });

  // Obtener usuario actual
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (!response.ok) throw new Error('Error al obtener usuario');
      
      const userData = await response.json();
      const userWithRole = await fetch(`/api/usuarios?roles=${userData.rolId || 3}`);
      
      if (userWithRole.ok) {
        const usersData = await userWithRole.json();
        const foundUser = usersData.find((u: Usuario) => u.id === userData.id);
        if (foundUser) {
          setCurrentUser(foundUser);
          return foundUser;
        }
      }
      return null;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar información del usuario');
      return null;
    }
  }, []);

  // Obtener todas las actividades
  const fetchActividades = useCallback(async (userId?: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('include_assigned', 'true');
      
      const url = `/api/actividades?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      setActividades(data);
      
      // Calcular estadísticas
      if (userId) {
        calculateStats(data, userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calcular estadísticas
  const calculateStats = useCallback((data: Actividad[], userId: number) => {
    const today = new Date();
    
    const total = data.length;
    const completadas = data.filter(a => a.estado === 'terminado').length;
    const pendientes = data.filter(a => a.estado !== 'terminado').length;
    
    const vencidas = data.filter(a => {
      const isNotCompleted = a.estado !== 'terminado';
      const isPastDue = new Date(a.fechaTermino) < today;
      return isNotCompleted && isPastDue;
    }).length;
    
    const proximasVencer = data.filter(a => {
      const isNotCompleted = a.estado !== 'terminado';
      const diffDays = Math.ceil((new Date(a.fechaTermino).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return isNotCompleted && diffDays <= 7 && diffDays >= 0;
    }).length;
    
    const misPendientes = data.filter(a => {
      const isPending = a.estado === 'inicio' || a.estado === 'en_proceso';
      const assignedUserId = a.usuarioAsignado?.id || a.usuario?.id;
      return isPending && assignedUserId === userId;
    }).length;
    
    const misAsignadas = data.filter(a => {
      return a.usuario?.id === userId && a.usuarioAsignado && a.usuarioAsignado.id !== userId;
    }).length;
    
    const porcentajeCompletado = total > 0 ? Math.round((completadas / total) * 100) : 0;
    
    setStats({
      total,
      completadas,
      pendientes,
      vencidas,
      proximasVencer,
      misPendientes,
      misAsignadas,
      porcentajeCompletado
    });
  }, []);

  // Completar actividad
  const completarActividad = useCallback(async (actividadId: number, glosaCierre?: string) => {
    try {
      const response = await fetch(`/api/actividades?id=${actividadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'terminado',
          glosa_cierre: glosaCierre?.trim() || undefined
        })
      });

      if (!response.ok) throw new Error('Error al completar la actividad');

      // Actualizar estado local
      setActividades(prev => 
        prev.map(act => 
          act.id === actividadId 
            ? { ...act, estado: 'terminado' as const, glosa_cierre: glosaCierre }
            : act
        )
      );

      toast.success('Actividad completada correctamente');
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al completar la actividad');
      return false;
    }
  }, []);

  // Obtener actividades pendientes del usuario
  const getActividadesPendientes = useCallback((userId: number, limit = 10) => {
    return actividades
      .filter(a => {
        const isPending = a.estado === 'inicio' || a.estado === 'en_proceso';
        const assignedUserId = a.usuarioAsignado?.id || a.usuario?.id;
        return isPending && assignedUserId === userId;
      })
      .sort((a, b) => new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime())
      .slice(0, limit);
  }, [actividades]);

  // Obtener actividades asignadas por el usuario
  const getActividadesAsignadas = useCallback((userId: number, limit = 20) => {
    return actividades
      .filter(a => a.usuario?.id === userId && a.usuarioAsignado && a.usuarioAsignado.id !== userId)
      .sort((a, b) => new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime())
      .slice(0, limit);
  }, [actividades]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    if (currentUser) {
      await fetchActividades(currentUser.id);
    }
  }, [currentUser, fetchActividades]);

  // Inicialización
  useEffect(() => {
    const initializeData = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        await fetchActividades(user.id);
      }
    };
    
    initializeData();
  }, [fetchCurrentUser, fetchActividades]);

  return {
    // Estados
    actividades,
    currentUser,
    isLoading,
    stats,
    
    // Funciones
    fetchActividades,
    completarActividad,
    getActividadesPendientes,
    getActividadesAsignadas,
    refreshData,
    
    // Funciones de utilidad
    calculateStats
  };
};