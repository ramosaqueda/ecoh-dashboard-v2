'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface ActividadMetrics {
  total: number;
  completadas: number;
  enProceso: number;
  porIniciar: number;
  vencidas: number;
  porVencer: number; // próximas 7 días
  misPendientes: number;
  misAsignadas: number;
  porcentajeCompletado: number;
  porcentajeVencidas: number;
}

export default function ActividadesMetrics() {
  const [metrics, setMetrics] = useState<ActividadMetrics>({
    total: 0,
    completadas: 0,
    enProceso: 0,
    porIniciar: 0,
    vencidas: 0,
    porVencer: 0,
    misPendientes: 0,
    misAsignadas: 0,
    porcentajeCompletado: 0,
    porcentajeVencidas: 0
  });
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
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
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Calcular métricas de actividades
  const fetchMetrics = async () => {
    if (!currentUser) return;
    
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
      
      // Calcular métricas
      const total = data.length;
      const completadas = data.filter((a: any) => a.estado === 'terminado').length;
      const enProceso = data.filter((a: any) => a.estado === 'en_proceso').length;
      const porIniciar = data.filter((a: any) => a.estado === 'inicio').length;
      
      const today = new Date();
      const vencidas = data.filter((a: any) => {
        const isNotCompleted = a.estado !== 'terminado';
        const isPastDue = new Date(a.fechaTermino) < today;
        return isNotCompleted && isPastDue;
      }).length;
      
      const porVencer = data.filter((a: any) => {
        const isNotCompleted = a.estado !== 'terminado';
        const diffDays = Math.ceil((new Date(a.fechaTermino).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return isNotCompleted && diffDays <= 7 && diffDays >= 0;
      }).length;
      
      // Actividades relacionadas con el usuario actual
      const misPendientes = data.filter((a: any) => {
        const isPending = a.estado === 'inicio' || a.estado === 'en_proceso';
        const assignedUserId = a.usuarioAsignado?.id || a.usuario?.id;
        return isPending && assignedUserId === currentUser.id;
      }).length;
      
      const misAsignadas = data.filter((a: any) => {
        return a.usuario?.id === currentUser.id && a.usuarioAsignado && a.usuarioAsignado.id !== currentUser.id;
      }).length;
      
      const porcentajeCompletado = total > 0 ? Math.round((completadas / total) * 100) : 0;
      const porcentajeVencidas = total > 0 ? Math.round((vencidas / total) * 100) : 0;
      
      setMetrics({
        total,
        completadas,
        enProceso,
        porIniciar,
        vencidas,
        porVencer,
        misPendientes,
        misAsignadas,
        porcentajeCompletado,
        porcentajeVencidas
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMetrics();
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.total}</div>
                <div className="text-sm text-muted-foreground">Total Actividades</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{metrics.completadas}</div>
                <div className="text-sm text-muted-foreground">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{metrics.misPendientes}</div>
                <div className="text-sm text-muted-foreground">Mis Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{metrics.vencidas}</div>
                <div className="text-sm text-muted-foreground">Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso y alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-green-600" />
              Progreso General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Actividades Completadas</span>
                  <span className="font-medium">{metrics.porcentajeCompletado}%</span>
                </div>
                <Progress value={metrics.porcentajeCompletado} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-yellow-600">{metrics.porIniciar}</div>
                  <div className="text-muted-foreground">Por Iniciar</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{metrics.enProceso}</div>
                  <div className="text-muted-foreground">En Proceso</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{metrics.completadas}</div>
                  <div className="text-muted-foreground">Completadas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-purple-600" />
              Mi Gestión de Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{metrics.misPendientes}</div>
                  <div className="text-xs text-blue-600">Asignadas a mí</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <div className="text-lg font-bold text-green-700">{metrics.misAsignadas}</div>
                  <div className="text-xs text-green-600">Asignadas por mí</div>
                </div>
              </div>
              
              {(metrics.vencidas > 0 || metrics.porVencer > 0) && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-600">Alertas</div>
                  {metrics.vencidas > 0 && (
                    <div className="bg-red-50 p-2 rounded-md border border-red-200">
                      <div className="text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {metrics.vencidas} actividades vencidas
                      </div>
                    </div>
                  )}
                  {metrics.porVencer > 0 && (
                    <div className="bg-orange-50 p-2 rounded-md border border-orange-200">
                      <div className="text-sm text-orange-700">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {metrics.porVencer} vencen en 7 días
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}