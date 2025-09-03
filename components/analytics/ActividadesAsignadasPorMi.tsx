'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Users, 
  Clock, 
  AlertTriangle,
  Loader2,
  Eye,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
    denominacionCausa: string;
  };
  tipoActividad: {
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  observacion?: string;
  glosa_cierre?: string;
  usuario?: {
    id: number;
    email?: string;
    nombre?: string;
  };
  usuarioAsignado?: {
    id: number;
    email?: string;
    nombre?: string;
    rol?: {
      nombre: string;
    };
  };
}

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

const getStatusIcon = (estado: string) => {
  switch (estado) {
    case 'inicio':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'en_proceso':
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    case 'terminado':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    default:
      return <XCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (fechaTermino: string, estado: string) => {
  if (estado === 'terminado') return 'border-l-green-500 bg-green-50';
  
  const today = new Date();
  const termino = new Date(fechaTermino);
  const diffDays = Math.ceil((termino.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'border-l-red-500 bg-red-50'; // Vencida
  if (diffDays <= 3) return 'border-l-orange-500 bg-orange-50'; // Próxima a vencer
  return 'border-l-blue-500 bg-blue-50'; // Normal
};

export default function ActividadesAsignadasPorMi() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el modal de detalle
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actividadDetail, setActividadDetail] = useState<Actividad | null>(null);

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
      toast.error('Error al cargar información del usuario');
    }
  };

  // Obtener actividades asignadas por el usuario actual
  const fetchActividadesAsignadas = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('include_assigned', 'true');
      
      const url = `/api/actividades?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      // Filtrar actividades asignadas por el usuario actual a otros usuarios
      const actividadesAsignadas = data.filter((actividad: any) => {
        return actividad.usuario?.id === currentUser.id && actividad.usuarioAsignado && actividad.usuarioAsignado.id !== currentUser.id;
      });
      
      // Ordenar por fecha de término
      actividadesAsignadas.sort((a: any, b: any) => 
        new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime()
      );
      
      setActividades(actividadesAsignadas.slice(0, 20)); // Mostrar las 20 más recientes
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades asignadas');
      setActividades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir modal de detalle
  const handleOpenDetailDialog = (actividad: Actividad) => {
    setActividadDetail(actividad);
    setShowDetailDialog(true);
  };

  // Effects
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchActividadesAsignadas();
    }
  }, [currentUser]);

  // Estadísticas
  const totalAsignadas = actividades.length;
  const completadas = actividades.filter(act => act.estado === 'terminado').length;
  const enProceso = actividades.filter(act => act.estado === 'en_proceso').length;
  const porIniciar = actividades.filter(act => act.estado === 'inicio').length;
  const vencidas = actividades.filter(act => 
    act.estado !== 'terminado' && new Date(act.fechaTermino) < new Date()
  ).length;

  const porcentajeCompletado = totalAsignadas > 0 ? Math.round((completadas / totalAsignadas) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Actividades Asignadas por Mí
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando actividades...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Actividades Asignadas por Mí
          </CardTitle>
          
          {/* Estadísticas y progreso */}
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{totalAsignadas} asignadas</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{completadas} completadas</span>
              </div>
              {vencidas > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{vencidas} vencidas</span>
                </div>
              )}
            </div>
            
            {totalAsignadas > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso general</span>
                  <span className="font-medium">{porcentajeCompletado}%</span>
                </div>
                <Progress value={porcentajeCompletado} className="h-2" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {actividades.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay actividades asignadas</h3>
              <p className="text-muted-foreground">Aún no has asignado actividades a otros usuarios.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {actividades.map((actividad) => {
                const fechaVencimiento = new Date(actividad.fechaTermino);
                const esVencida = fechaVencimiento < new Date() && actividad.estado !== 'terminado';
                const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={actividad.id}
                    className={`border-l-4 bg-card p-4 rounded-md shadow-sm ${getPriorityColor(actividad.fechaTermino, actividad.estado)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(actividad.estado)}
                          <h4 className="font-medium text-sm truncate">
                            {actividad.tipoActividad.nombre}
                          </h4>
                          {getEstadoBadge(actividad.estado)}
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{actividad.causa.ruc}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              Asignado a: {actividad.usuarioAsignado?.nombre || actividad.usuarioAsignado?.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={esVencida ? 'text-red-600 font-medium' : ''}>
                              Vence: {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                              {actividad.estado !== 'terminado' && !esVencida && diasRestantes <= 7 && (
                                <span className="ml-1">
                                  ({diasRestantes > 0 ? `${diasRestantes} días` : 'Hoy'})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {actividad.observacion && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded truncate">
                            {actividad.observacion}
                          </div>
                        )}
                        
                        {actividad.glosa_cierre && actividad.estado === 'terminado' && (
                          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                            <strong>Comentarios de cierre:</strong> {actividad.glosa_cierre}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDetailDialog(actividad)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalles</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {actividades.length === 20 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => window.open('/dashboard/actividades', '_blank')}>
                    Ver todas las actividades
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Actividad Asignada</DialogTitle>
          </DialogHeader>
          
          {actividadDetail && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{actividadDetail.tipoActividad.nombre}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  ID: {actividadDetail.id}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">RUC</label>
                  <p className="text-sm">{actividadDetail.causa.ruc}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">{getEstadoBadge(actividadDetail.estado)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Denominación de la Causa</label>
                <p className="text-sm mt-1">{actividadDetail.causa.denominacionCausa}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Asignado a</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {actividadDetail.usuarioAsignado?.nombre || actividadDetail.usuarioAsignado?.email}
                    </div>
                    {actividadDetail.usuarioAsignado?.rol && (
                      <div className="text-xs text-muted-foreground">
                        {actividadDetail.usuarioAsignado.rol.nombre}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {actividadDetail.observacion && (
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md">{actividadDetail.observacion}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha de Inicio</label>
                  <p className="text-sm">{format(new Date(actividadDetail.fechaInicio), 'dd/MM/yyyy', { locale: es })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de Vencimiento</label>
                  <p className="text-sm">{format(new Date(actividadDetail.fechaTermino), 'dd/MM/yyyy', { locale: es })}</p>
                </div>
              </div>
              
              {actividadDetail.glosa_cierre && (
                <div>
                  <label className="text-sm font-medium">Comentarios de Cierre</label>
                  <p className="text-sm mt-1 bg-green-50 p-3 rounded-md border border-green-200">{actividadDetail.glosa_cierre}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}