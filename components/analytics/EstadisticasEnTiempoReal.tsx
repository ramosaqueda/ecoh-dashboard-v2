'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useActividades } from '@/hooks/actividades';

export default function EstadisticasEnTiempoReal() {
  const { stats, isLoading, currentUser, refreshData } = useActividades();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
      setLastUpdate(new Date());
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [refreshData]);

  // Actualizar timestamp cuando cambian los datos
  useEffect(() => {
    if (!isLoading) {
      setLastUpdate(new Date());
    }
  }, [stats, isLoading]);

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando información del usuario...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular indicadores de rendimiento
  const indicadorUrgencia = () => {
    if (stats.vencidas > 0) return { nivel: 'crítico', color: 'text-red-600', icon: AlertCircle };
    if (stats.proximasVencer > 3) return { nivel: 'alto', color: 'text-orange-600', icon: Clock };
    if (stats.misPendientes > 10) return { nivel: 'medio', color: 'text-yellow-600', icon: Activity };
    return { nivel: 'normal', color: 'text-green-600', icon: CheckCircle2 };
  };

  const urgencia = indicadorUrgencia();
  const IconoUrgencia = urgencia.icon;

  // Clases CSS para el componente de vencidas
  const vencidasBgClass = stats.vencidas > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
  const vencidasTextClass = stats.vencidas > 0 ? 'text-red-700' : 'text-gray-700';
  const vencidasLabelClass = stats.vencidas > 0 ? 'text-red-600' : 'text-gray-600';

  // Clases CSS para eficiencia
  const eficienciaClass = stats.porcentajeCompletado >= 80 ? 'text-green-600' : 
                         stats.porcentajeCompletado >= 60 ? 'text-yellow-600' : 'text-red-600';

  // Clases CSS para carga de trabajo
  const cargaClass = stats.misPendientes <= 5 ? 'text-green-600' : 
                    stats.misPendientes <= 10 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-blue-600" />
            Panel de Control - {currentUser.nombre || currentUser.email}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {lastUpdate.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Badge>
            
            <Badge variant={urgencia.nivel === 'crítico' ? 'destructive' : 'secondary'} className="text-xs">
              <IconoUrgencia className="h-3 w-3 mr-1" />
              {urgencia.nivel.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Métricas principales en formato compacto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{stats.misPendientes}</div>
                <div className="text-xs text-blue-600 font-medium">Mis Pendientes</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.completadas}</div>
                <div className="text-xs text-green-600 font-medium">Completadas</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{stats.misAsignadas}</div>
                <div className="text-xs text-purple-600 font-medium">Asignadas por Mí</div>
              </div>
              
              <div className={`text-center p-3 rounded-lg border ${vencidasBgClass}`}>
                <div className={`text-2xl font-bold ${vencidasTextClass}`}>
                  {stats.vencidas}
                </div>
                <div className={`text-xs font-medium ${vencidasLabelClass}`}>
                  Vencidas
                </div>
              </div>
            </div>

            {/* Progreso y alertas */}
            <div className="space-y-4">
              {/* Barra de progreso general */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progreso General</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.porcentajeCompletado}% completado
                  </span>
                </div>
                <Progress value={stats.porcentajeCompletado} className="h-2" />
              </div>
              
              {/* Alertas de urgencia */}
              {(stats.vencidas > 0 || stats.proximasVencer > 0) && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Alertas Activas</div>
                  
                  {stats.vencidas > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="text-sm text-red-700">
                        <strong>{stats.vencidas}</strong> actividades vencidas requieren atención inmediata
                      </span>
                    </div>
                  )}
                  
                  {stats.proximasVencer > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                      <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-orange-700">
                        <strong>{stats.proximasVencer}</strong> actividades vencen en los próximos 7 días
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Indicadores de productividad */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Eficiencia</span>
                  </div>
                  <div className={`text-lg font-bold ${eficienciaClass}`}>
                    {stats.porcentajeCompletado}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Gestión</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {stats.misAsignadas}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium text-gray-700">Carga</span>
                  </div>
                  <div className={`text-lg font-bold ${cargaClass}`}>
                    {stats.misPendientes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Indicador de estado en vivo */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">En vivo</span>
        </div>
      </div>
    </Card>
  );
}