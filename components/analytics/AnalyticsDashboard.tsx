'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  User,
  Users,
  Activity,
  ArrowRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ActivityMetrics {
  totalAsignadas: number;
  totalRecibidas: number;
  completadasAsignadas: number;
  completadasRecibidas: number;
  pendientesAsignadas: number;
  pendientesRecibidas: number;
  vencidasAsignadas: number;
  vencidasRecibidas: number;
  promedioCompletamiento: number;
}

interface ActividadResumen {
  id: number;
  tipoActividad: {
    nombre: string;
  };
  causa: {
    ruc: string;
    denominacionCausa: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuarioAsignado?: {
    nombre: string;
    email: string;
  };
  usuario?: {
    nombre: string;
    email: string;
  };
}

interface TrendData {
  periodo: string;
  asignadas: number;
  completadas: number;
  eficiencia: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [actividadesAsignadas, setActividadesAsignadas] = useState<ActividadResumen[]>([]);
  const [actividadesRecibidas, setActividadesRecibidas] = useState<ActividadResumen[]>([]);
  const [tendencias, setTendencias] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const router = useRouter();
  const hasFetchedRef = useRef(false);
  
  // 🔧 SOLUCIÓN: Usar useAuth de Clerk para esperar a que esté listo
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    // 🔧 CRITICAL: Esperar a que Clerk esté completamente cargado Y el usuario esté autenticado
    if (!isLoaded) {
      console.log('⏳ Esperando a que Clerk se cargue...');
      return;
    }

    if (!isSignedIn) {
      console.log('❌ Usuario no autenticado');
      setIsLoading(false);
      return;
    }

    // Prevenir doble ejecución
    if (hasFetchedRef.current) {
      console.log('⏭️ Skip fetch - already executed');
      return;
    }
    
    hasFetchedRef.current = true;
    console.log('✅ Clerk listo y usuario autenticado - Iniciando carga...');
    
    fetchAnalytics();
    fetchCurrentUser();
    
  }, [isLoaded, isSignedIn]); // 🔧 Dependencias: esperar a isLoaded e isSignedIn

  const fetchCurrentUser = async () => {
    try {
      console.log('👤 Fetching current user...');
      const response = await fetch('/api/usuarios/me', { 
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        console.log('✅ Usuario cargado:', userData.nombre);
      } else {
        console.error('❌ Error usuario:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // 📊 Métricas
      try {
        console.log('📊 [1/4] Fetching metrics...');
        const metricsResponse = await fetch('/api/analytics/actividades', { 
          credentials: 'include'
        });
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
          console.log('✅ [1/4] Metrics loaded');
        } else {
          console.warn('⚠️ [1/4] Error:', metricsResponse.status, metricsResponse.statusText);
        }
      } catch (error) {
        console.error('❌ [1/4] Error en métricas:', error);
      }

      // 📤 Actividades asignadas por mí
      try {
        console.log('📤 [2/4] Fetching actividades asignadas...');
        const asignadasResponse = await fetch(
          '/api/actividades?creadas_por_mi=true&limit=5&include_assigned=true',
          { credentials: 'include' }
        );
        
        if (asignadasResponse.ok) {
          const asignadasData = await asignadasResponse.json();
          setActividadesAsignadas(asignadasData.data || []);
          console.log('✅ [2/4] Actividades asignadas loaded:', asignadasData.data?.length || 0);
        } else {
          console.warn('⚠️ [2/4] Error:', asignadasResponse.status, asignadasResponse.statusText);
        }
      } catch (error) {
        console.error('❌ [2/4] Error en actividades asignadas:', error);
      }

      // 📥 Actividades asignadas a mí
      try {
        console.log('📥 [3/4] Fetching actividades recibidas...');
        const recibidasResponse = await fetch(
          '/api/actividades?asignadas_a_mi=true&limit=5&include_assigned=true',
          { credentials: 'include' }
        );
        
        if (recibidasResponse.ok) {
          const recibidasData = await recibidasResponse.json();
          setActividadesRecibidas(recibidasData.data || []);
          console.log('✅ [3/4] Actividades recibidas loaded:', recibidasData.data?.length || 0);
        } else {
          console.warn('⚠️ [3/4] Error:', recibidasResponse.status, recibidasResponse.statusText);
        }
      } catch (error) {
        console.error('❌ [3/4] Error en actividades recibidas:', error);
      }

      // 📈 Tendencias
      try {
        console.log('📈 [4/4] Fetching tendencias...');
        const tendenciasResponse = await fetch('/api/analytics/tendencias', { 
          credentials: 'include'
        });
        
        if (tendenciasResponse.ok) {
          const tendenciasData = await tendenciasResponse.json();
          setTendencias(tendenciasData);
          console.log('✅ [4/4] Tendencias loaded');
        } else {
          console.warn('⚠️ [4/4] Error:', tendenciasResponse.status, tendenciasResponse.statusText);
        }
      } catch (error) {
        console.error('❌ [4/4] Error en tendencias:', error);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Carga completa en ${duration}ms`);

    } catch (error) {
      console.error('❌ Error general cargando analíticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    hasFetchedRef.current = false;
    fetchAnalytics();
    fetchCurrentUser();
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'inicio':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Por Iniciar</Badge>;
      case 'en_proceso':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Proceso</Badge>;
      case 'terminado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const isVencida = (fechaTermino: string) => {
    return new Date(fechaTermino) < new Date();
  };

  const getDaysRemaining = (fechaTermino: string) => {
    const diffTime = new Date(fechaTermino).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewActivity = (actividadId: number) => {
    router.push(`/dashboard/todo?highlight=${actividadId}`);
  };

  const handleViewAllAssigned = () => {
    router.push('/dashboard/actividades?creadas_por_mi=true');
  };

  const handleViewAllReceived = () => {
    router.push('/dashboard/todo');
  };

  // 🔧 Mostrar loading mientras Clerk se inicializa
  if (!isLoaded || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // 🔧 Mostrar mensaje si no está autenticado
  if (!isSignedIn) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Por favor, inicia sesión para ver las analíticas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas de Actividades</h1>
          <p className="text-gray-600 mt-1">
            Resumen de tu gestión y rendimiento
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Métricas Principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actividades que he asignado</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalAsignadas}</p>
                  <p className="text-xs text-gray-500">
                    {metrics.completadasAsignadas} completadas
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actividades Recibidas</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.totalRecibidas}</p>
                  <p className="text-xs text-gray-500">
                    {metrics.completadasRecibidas} completadas
                  </p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.pendientesAsignadas + metrics.pendientesRecibidas}
                  </p>
                  <p className="text-xs text-gray-500">
                    {metrics.vencidasAsignadas + metrics.vencidasRecibidas} vencidas
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.promedioCompletamiento}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Promedio de cumplimiento
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tendencias */}
      {tendencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendencia de Actividades (Últimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {tendencias.map((item, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">{item.periodo}</p>
                  <p className="text-lg font-bold text-blue-600">{item.asignadas}</p>
                  <p className="text-xs text-gray-500">asignadas</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{item.completadas}</p>
                  <p className="text-xs text-gray-500">completadas</p>
                  <div className="mt-2">
                    <Badge variant={item.eficiencia >= 80 ? "default" : item.eficiencia >= 60 ? "secondary" : "destructive"}>
                      {item.eficiencia}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tablas de Actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividades que he asignado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Actividades que he Asignado
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleViewAllAssigned}
              >
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {actividadesAsignadas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No has asignado actividades recientemente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actividadesAsignadas.map((actividad) => (
                  <div 
                    key={actividad.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {actividad.tipoActividad.nombre}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {actividad.causa.ruc} - {actividad.causa.denominacionCausa}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getEstadoBadge(actividad.estado)}
                          {actividad.estado !== 'terminado' && isVencida(actividad.fechaTermino) && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewActivity(actividad.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Asignado a: {actividad.usuarioAsignado?.nombre || 'Sin asignar'}
                      </span>
                      <span>
                        {actividad.estado === 'terminado' 
                          ? 'Completado' 
                          : `${getDaysRemaining(actividad.fechaTermino)} días`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividades que me han asignado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mis Tareas Asignadas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleViewAllReceived}
              >
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {actividadesRecibidas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No tienes tareas asignadas pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actividadesRecibidas.map((actividad) => (
                  <div 
                    key={actividad.id} 
                    className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      actividad.estado !== 'terminado' && isVencida(actividad.fechaTermino) 
                        ? 'border-red-200 bg-red-50' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {actividad.tipoActividad.nombre}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {actividad.causa.ruc} - {actividad.causa.denominacionCausa}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getEstadoBadge(actividad.estado)}
                          {actividad.estado !== 'terminado' && isVencida(actividad.fechaTermino) && (
                            <Badge variant="destructive" className="text-xs">
                              ¡Vencida!
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewActivity(actividad.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Asignado por: {actividad.usuario?.nombre || 'Sistema'}
                      </span>
                      <span>
                        {actividad.estado === 'terminado' 
                          ? 'Completado' 
                          : isVencida(actividad.fechaTermino)
                            ? `Vencida hace ${Math.abs(getDaysRemaining(actividad.fechaTermino))} días`
                            : `${getDaysRemaining(actividad.fechaTermino)} días restantes`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Estado Actual */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Actividades Urgentes</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {actividadesRecibidas.filter(a => 
                    a.estado !== 'terminado' && getDaysRemaining(a.fechaTermino) <= 3
                  ).length}
                </p>
                <p className="text-xs text-blue-600">Vencen en 3 días o menos</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Completadas Hoy</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {actividadesRecibidas.filter(a => 
                    a.estado === 'terminado' && 
                    format(new Date(), 'yyyy-MM-dd') === format(new Date(a.fechaTermino), 'yyyy-MM-dd')
                  ).length}
                </p>
                <p className="text-xs text-green-600">Tareas finalizadas</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-800">En Progreso</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {actividadesRecibidas.filter(a => a.estado === 'en_proceso').length}
                </p>
                <p className="text-xs text-orange-600">Tareas activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
