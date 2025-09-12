// app/dashboard/actividades/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Edit,
  Save,
  X,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
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
    nombre: string;
  };
  usuarioAsignado?: {
    email: string;
    nombre: string;
  };
}

const ESTADOS = [
  { value: 'inicio', label: 'Inicio', color: 'bg-blue-500' },
  { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-500' },
  { value: 'terminado', label: 'Terminado', color: 'bg-green-500' }
];

export default function ActividadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const actividadId = params.id as string;

  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estados de edición
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  useEffect(() => {
    if (actividadId) {
      fetchActividad();
    }
  }, [actividadId]);

  const fetchActividad = async () => {
    try {
      const response = await fetch(`/api/actividades?id=${actividadId}&include_assigned=true`);
      if (!response.ok) throw new Error('Error al cargar la actividad');
      
      const data = await response.json();
      setActividad(data);
      setNuevoEstado(data.estado);
      setNuevaObservacion(data.observacion || '');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualizarEstado = async () => {
    if (!actividad) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/actividades?id=${actividad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          observacion: nuevaObservacion
        })
      });

      if (!response.ok) throw new Error('Error al actualizar la actividad');

      const updatedActividad = await response.json();
      setActividad(updatedActividad);
      setIsEditing(false);
      
      toast.success('Actividad actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la actividad');
    } finally {
      setIsUpdating(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = ESTADOS.find(e => e.value === estado);
    return estadoInfo || { label: estado, color: 'bg-gray-500' };
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Actividad no encontrada
          </h2>
          <p className="mt-2 text-muted-foreground">
            La actividad solicitada no existe o no tienes permisos para verla.
          </p>
        </div>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(actividad.estado);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Actividad #{actividad.id}</h1>
            <p className="text-muted-foreground">Causa: {actividad.causa.ruc}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            className={`${estadoBadge.color} text-white`}
          >
            {estadoBadge.label}
          </Badge>
          
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de la Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tipo de Actividad
                  </Label>
                  <p className="text-sm font-medium">{actividad.tipoActividad.nombre}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Causa (RUC)
                  </Label>
                  <p className="text-sm font-medium">{actividad.causa.ruc}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fecha de Inicio
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(actividad.fechaInicio)}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fecha de Término
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(actividad.fechaTermino)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Estado de la Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="estado">Nuevo Estado</Label>
                    <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${estado.color}`} />
                              {estado.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="observacion">Observaciones</Label>
                    <Textarea
                      id="observacion"
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      placeholder="Agregar observaciones sobre el estado de la actividad..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={isUpdating}>
                          <Save className="h-4 w-4 mr-2" />
                          {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Actualización</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro que deseas actualizar el estado de esta actividad? 
                            Esta acción enviará notificaciones a los usuarios correspondientes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleActualizarEstado}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setNuevoEstado(actividad.estado);
                        setNuevaObservacion(actividad.observacion || '');
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${estadoBadge.color}`} />
                    <span className="font-medium">{estadoBadge.label}</span>
                  </div>
                  
                  {actividad.observacion && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Observaciones
                      </Label>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {actividad.observacion}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Información de Usuarios */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Usuario Creador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{actividad.usuario.nombre}</p>
                  <p className="text-sm text-muted-foreground">{actividad.usuario.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {actividad.usuarioAsignado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Usuario Asignado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{actividad.usuarioAsignado.nombre}</p>
                    <p className="text-sm text-muted-foreground">{actividad.usuarioAsignado.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/causas/${actividad.causa.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Causa Completa
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/actividades')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Actividades
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
