'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Bell,
  Users,
  Eye,
  Loader2,
  RefreshCw,
  Settings,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActividades, useNotificacionesTiempoReal } from '@/hooks/actividades';

export default function CentroControlActividades() {
  const { 
    stats, 
    currentUser, 
    isLoading: isLoadingActividades,
    refreshData 
  } = useActividades();
  
  const {
    notificaciones,
    notificacionesNoLeidas,
    isLoading: isLoadingNotificaciones
  } = useNotificacionesTiempoReal();

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manejo de refresh manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error al actualizar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const isLoading = isLoadingActividades || isLoadingNotificaciones;

  // Calcular métricas combinadas
  const metricas = {
    actividadesVencidas: stats.vencidas,
    actividadesProximasVencer: stats.proximasVencer,
    misPendientes: stats.misPendientes,
    misAsignadas: stats.misAsignadas,
    notificacionesPendientes: notificacionesNoLeidas,
    porcentajeEficiencia: stats.porcentajeCompletado,
    alertasActivas: stats.vencidas + (notificacionesNoLeidas > 5 ? 1 : 0)
  };

  // Determinar nivel de urgencia global
  const getNivelUrgenciaGlobal = () => {
    if (metricas.actividadesVencidas > 0 || metricas.alertasActivas > 2) {
      return { nivel: 'CRÍTICO', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
    if (metricas.actividadesProximasVencer > 3 || metricas.notificacionesPendientes > 10) {
      return { nivel: 'ALTO', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    }
    if (metricas.misPendientes > 8 || metricas.notificacionesPendientes > 5) {
      return { nivel: 'MEDIO', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    }
    return { nivel: 'NORMAL', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  };

  const urgenciaGlobal = getNivelUrgenciaGlobal();

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span>Cargando centro de control...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${urgenciaGlobal.borderColor} ${urgenciaGlobal.bgColor}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Centro de Control de Actividades
            <Badge variant={urgenciaGlobal.nivel === 'CRÍTICO' ? 'destructive' : 'secondary'} className="text-xs">
              {urgenciaGlobal.nivel}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {lastRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Resumen rápido */}
        <div className="text-sm text-muted-foreground">
          {currentUser.nombre || currentUser.email} • {metricas.misPendientes} pendientes • {metricas.notificacionesPendientes} notificaciones no leídas
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard de métricas críticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className={`h-5 w-5 ${metricas.actividadesVencidas > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div className={`text-2xl font-bold ${metricas.actividadesVencidas > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {metricas.actividadesVencidas}
                </div>
                <div className="text-xs text-muted-foreground">Vencidas</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{metricas.actividadesProximasVencer}</div>
                <div className="text-xs text-muted-foreground">Próximas</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{metricas.misPendientes}</div>
                <div className="text-xs text-muted-foreground">Mis Tareas</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Bell className={`h-5 w-5 ${metricas.notificacionesPendientes > 0 ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
                <div className={`text-2xl font-bold ${metricas.notificacionesPendientes > 0 ? 'text-purple-600' : 'text-gray-600'}`}>
                  {metricas.notificacionesPendientes}
                </div>
                <div className="text-xs text-muted-foreground">Notificaciones</div>
              </div>
            </div>

            {/* Alertas críticas */}
            {metricas.alertasActivas > 0 && (
              <div className={`p-4 rounded-lg border-l-4 ${urgenciaGlobal.bgColor} border-l-red-500`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                  <div>
                    <h4 className="font-semibold text-red-800">Atención Requerida</h4>
                    <p className="text-sm text-red-700">
                      {metricas.actividadesVencidas > 0 && `${metricas.actividadesVencidas} actividades vencidas requieren acción inmediata. `}
                      {metricas.notificacionesPendientes > 5 && `${metricas.notificacionesPendientes} notificaciones pendientes.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs de funcionalidades */}
            <Tabs defaultValue="actividades" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actividades" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Mis Asignaciones ({metricas.misAsignadas})
                </TabsTrigger>
                <TabsTrigger value="notificaciones" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificaciones ({metricas.notificacionesPendientes})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="actividades" className="mt-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Vista Resumida de Actividades Asignadas</h4>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle Completo
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">{stats.misAsignadas}</div>
                        <div className="text-xs text-blue-600">Total Asignadas</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          {Math.round((stats.completadas / (stats.total || 1)) * 100)}%
                        </div>
                        <div className="text-xs text-green-600">Completadas</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-700">
                          {stats.total - stats.completadas}
                        </div>
                        <div className="text-xs text-orange-600">En Progreso</div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Ver todas las actividades asignadas
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notificaciones" className="mt-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Notificaciones Recientes</h4>
                    <Badge variant={metricas.notificacionesPendientes > 0 ? 'destructive' : 'secondary'}>
                      {metricas.notificacionesPendientes} no leídas
                    </Badge>
                  </div>
                  
                  {notificaciones.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay notificaciones recientes
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notificaciones.slice(0, 3).map((notif) => (
                        <div key={notif.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                          <Bell className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{notif.titulo}</div>
                            <div className="text-xs text-muted-foreground truncate">{notif.mensaje}</div>
                          </div>
                          {!notif.leida && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                      ))}
                      
                      {notificaciones.length > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-purple-600">
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Ver todas ({notificaciones.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Acciones rápidas del centro de control */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                Acciones Rápidas del Sistema
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                  <Activity className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">Ver Actividades</div>
                    <div className="text-xs text-muted-foreground">Gestión completa</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">Asignar Nueva</div>
                    <div className="text-xs text-muted-foreground">Crear asignación</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                  <Bell className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">Centro Notif.</div>
                    <div className="text-xs text-muted-foreground">Ver todas</div>
                  </div>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start h-auto p-3">
                  <Settings className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">Configuración</div>
                    <div className="text-xs text-muted-foreground">Personalizar</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Indicador de estado del sistema */}
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${{
            'CRÍTICO': 'bg-red-500',
            'ALTO': 'bg-orange-500', 
            'MEDIO': 'bg-yellow-500',
            'NORMAL': 'bg-green-500'
          }[urgenciaGlobal.nivel]}`}></div>
          <span className="text-xs text-muted-foreground">Sistema</span>
        </div>
      </div>
    </Card>
  );
}