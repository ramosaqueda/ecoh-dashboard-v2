'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar,
  Users,
  Target,
  Award,
  Clock,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ResumenEjecutivoActividades() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Resumen semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-blue-600" />
            Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Creadas</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-bold">5</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completadas</span>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">3</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Asignadas</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-600">2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumen mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Este Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Creadas</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-bold">18</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completadas</span>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">15</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Asignadas</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-600">8</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Métricas de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-orange-600" />
            Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tareas/día</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-bold">2.3</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eficiencia</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">85%</span>
              </div>
            </div>
            
            {/* Top tipos de actividad */}
            <div className="pt-2 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-2">Tipos más frecuentes</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[120px]">Investigación</span>
                  <Badge variant="outline" className="text-xs">15</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[120px]">Revisión</span>
                  <Badge variant="outline" className="text-xs">8</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[120px]">Análisis</span>
                  <Badge variant="outline" className="text-xs">6</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}