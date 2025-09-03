'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Users, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificacionesTiempoReal } from '@/hooks/actividades';
import ListadoActividadesAsignadas from './ListadoActividadesAsignadas';
import NotificacionesTiempoReal from './NotificacionesTiempoReal';
 

export default function CentroGestionActividades() {
  const { notificacionesNoLeidas } = useNotificacionesTiempoReal();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header del centro de gestión */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Centro de Gestión de Actividades
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tus asignaciones y recibe notificaciones en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {notificacionesNoLeidas > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {notificacionesNoLeidas} nuevas
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="asignadas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="asignadas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mis Asignaciones
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {notificacionesNoLeidas > 0 && (
              <Badge variant="destructive" className="text-xs ml-1">
                {notificacionesNoLeidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Demo Sistema
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="asignadas" className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Actividades que He Asignado
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Monitorea el progreso de las actividades que has asignado a otros usuarios
            </p>
            <ListadoActividadesAsignadas key={`listado-${refreshKey}`} />
          </div>
        </TabsContent>
        
        <TabsContent value="notificaciones" className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Centro de Notificaciones en Tiempo Real
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Recibe alertas automáticas cuando se te asignan actividades o cuando cambian de estado
            </p>
            
            {/* Estadísticas de notificaciones */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">12</div>
                  <div className="text-xs text-blue-600">Asignaciones</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">8</div>
                  <div className="text-xs text-orange-600">Cambios Estado</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">15</div>
                  <div className="text-xs text-green-600">Completadas</div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">3</div>
                  <div className="text-xs text-red-600">Vencimientos</div>
                </div>
              </Card>
            </div>
            
            <NotificacionesTiempoReal key={`notif-real-${refreshKey}`} />
          </div>
        </TabsContent>
        
        
      </Tabs>
    </div>
  );
}