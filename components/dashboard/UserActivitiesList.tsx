'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Actividad {
  id: number;
  causa: {
    ruc: string;
    denominacionCausa: string;
  };
  tipoActividad: {
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
}

const estadoBadgeVariants = {
  inicio: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  terminado: 'bg-green-100 text-green-800'
};

const estadoTexto = {
  inicio: 'Inicio',
  en_proceso: 'En Proceso',
  terminado: 'Terminado'
};

export function UserActivitiesList() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        setError(null);
        const response = await fetch('/api/actividades/usuario');
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error al cargar actividades');
        }
        
        const data = await response.json();
        setActividades(data);
      } catch (error) {
        console.error('Error:', error);
        // ✅ Verificación de tipo segura
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchActividades();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Mis Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Mis Actividades</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : actividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No tienes actividades pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {actividades.map((actividad) => (
              <div
                key={actividad.id}
                className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {actividad.tipoActividad.nombre}
                  </div>
                  <Badge 
                    variant="secondary"
                    className={estadoBadgeVariants[actividad.estado]}
                  >
                    {estadoTexto[actividad.estado]}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  RUC: {actividad.causa.ruc}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {actividad.causa.denominacionCausa}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Inicio: {format(new Date(actividad.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                  </span>
                  <span>
                    Término: {format(new Date(actividad.fechaTermino), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}