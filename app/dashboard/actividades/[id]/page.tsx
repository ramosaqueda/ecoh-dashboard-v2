'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  FileText, 
  Building,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
    denominacionCausa: string;
  };
  tipoActividad: {
    id: number;
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  observacion: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: {
    email: string;
  };
  glosa_cierre?: string;
}

const EstadoBadge = ({ estado }: { estado: string }) => {
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'inicio':
        return { color: 'bg-yellow-100 text-yellow-800', texto: 'Inicio' };
      case 'en_proceso':
        return { color: 'bg-blue-100 text-blue-800', texto: 'En Proceso' };
      case 'terminado':
        return { color: 'bg-green-100 text-green-800', texto: 'Terminado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', texto: estado };
    }
  };

  const config = getEstadoConfig(estado);

  return (
    <Badge className={config.color}>
      {config.texto}
    </Badge>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-24" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-24" />
      </CardContent>
    </Card>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
    <h2 className="text-xl font-semibold text-gray-900 mb-2">
      Actividad no encontrada
    </h2>
    <p className="text-gray-500 mb-4 text-center">
      La actividad que buscas no existe o no tienes permisos para verla.
    </p>
    <div className="space-x-2">
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
      <Link href="/dashboard/actividades">
        <Button variant="default">
          Volver a Actividades
        </Button>
      </Link>
    </div>
  </div>
);

export default function ActividadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actividadId = params.id as string;

  const fetchActividad = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/actividades/${actividadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Actividad no encontrada');
        }
        throw new Error('Error al cargar la actividad');
      }
      
      const data = await response.json();
      setActividad(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (actividadId) {
      fetchActividad();
    }
  }, [actividadId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    // Navegar a la página de edición o abrir modal
    router.push(`/dashboard/actividades?edit=${actividadId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !actividad) {
    return (
      <div className="container mx-auto py-6 px-4">
        <ErrorState onRetry={fetchActividad} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/actividades">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Actividad #{actividad.id}
            </h1>
            <p className="text-gray-500">
              {actividad.tipoActividad.nombre}
            </p>
          </div>
        </div>
        <Button onClick={handleEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Información Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Información General
            <EstadoBadge estado={actividad.estado} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de la Causa */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Causa
                  </label>
                  <p className="text-gray-900 font-mono text-lg">
                    {actividad.causa.ruc}
                  </p>
                  {actividad.causa.denominacionCausa && (
                    <p className="text-gray-600 text-sm">
                      {actividad.causa.denominacionCausa}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Creado por
                  </label>
                  <p className="text-gray-900">
                    {actividad.usuario.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de Inicio
                  </label>
                  <p className="text-gray-900">
                    {formatDate(actividad.fechaInicio)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Fecha de Término
                  </label>
                  <p className="text-gray-900">
                    {formatDate(actividad.fechaTermino)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {actividad.observacion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {actividad.observacion}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Glosa de Cierre (si existe) */}
      {actividad.glosa_cierre && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Glosa de Cierre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {actividad.glosa_cierre}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                ¿Necesitas hacer cambios en esta actividad?
              </p>
            </div>
            <div className="space-x-2">
              <Link href="/dashboard/actividades">
                <Button variant="outline">
                  Volver a la Lista
                </Button>
              </Link>
              <Button onClick={handleEdit}>
                Editar Actividad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
