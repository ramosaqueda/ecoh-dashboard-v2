'use client';

import { useActividades } from '@/hooks/actividades/useActividades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function EstadisticasEnTiempoRealSimple() {
  const { stats, currentUser, isLoading } = useActividades();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estadísticas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando información del usuario...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Panel de Control - {currentUser.nombre || currentUser.email}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border">
            <div className="text-2xl font-bold text-blue-700">{stats.misPendientes}</div>
            <div className="text-xs text-blue-600">Mis Pendientes</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border">
            <div className="text-2xl font-bold text-green-700">{stats.completadas}</div>
            <div className="text-xs text-green-600">Completadas</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border">
            <div className="text-2xl font-bold text-purple-700">{stats.misAsignadas}</div>
            <div className="text-xs text-purple-600">Asignadas por Mí</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg border">
            <div className="text-2xl font-bold text-red-700">{stats.vencidas}</div>
            <div className="text-xs text-red-600">Vencidas</div>
          </div>
        </div>

        {stats.vencidas > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Tienes {stats.vencidas} actividades vencidas que requieren atención
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
