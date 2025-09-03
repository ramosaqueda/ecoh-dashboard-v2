'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2,
  Eye,
  Calendar,
  FileText
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
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
};

const getPriorityColor = (fechaTermino: string) => {
  const today = new Date();
  const termino = new Date(fechaTermino);
  const diffDays = Math.ceil((termino.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'border-l-red-500 bg-red-50'; // Vencida
  if (diffDays <= 3) return 'border-l-orange-500 bg-orange-50'; // Próxima a vencer
  return 'border-l-blue-500 bg-blue-50'; // Normal
};

export default function ActividadesPendientesTodo() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el modal de cierre
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [actividadToClose, setActividadToClose] = useState<Actividad | null>(null);
  const [glosaCierre, setGlosaCierre] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Obtener actividades pendientes del usuario actual
  const fetchActividades = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      params.append('include_assigned', 'true');
      
      const url = `/api/actividades?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      // Filtrar actividades pendientes asignadas al usuario actual
      const actividadesPendientes = data.filter((actividad: any) => {
        const isPending = actividad.estado === 'inicio' || actividad.estado === 'en_proceso';
        const assignedUserId = actividad.usuarioAsignado?.id || actividad.usuario?.id;
        return isPending && assignedUserId === currentUser.id;
      });
      
      // Ordenar por fecha de término (más urgentes primero)
      actividadesPendientes.sort((a: any, b: any) => 
        new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime()
      );
      
      setActividades(actividadesPendientes.slice(0, 10)); // Mostrar solo las 10 más urgentes
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades');
      setActividades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre de actividad
  const handleActivityClose = async () => {
    if (!actividadToClose) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/actividades?id=${actividadToClose.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'terminado',
          glosa_cierre: glosaCierre.trim() || undefined
        })
      });

      if (!response.ok) throw new Error('Error al cerrar la actividad');

      // Remover actividad de la lista local
      setActividades(prev => prev.filter(act => act.id !== actividadToClose.id));

      toast.success('Actividad completada correctamente');
      setShowCloseDialog(false);
      setActividadToClose(null);
      setGlosaCierre('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al completar la actividad');
    } finally {
      setIsUpdating(false);
    }
  };

  // Abrir modal de cierre
  const handleOpenCloseDialog = (actividad: Actividad) => {
    setActividadToClose(actividad);
    setGlosaCierre(actividad.glosa_cierre || '');
    setShowCloseDialog(true);
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
      fetchActividades();
    }
  }, [currentUser]);

  // Estadísticas rápidas
  const actividadesVencidas = actividades.filter(act => 
    new Date(act.fechaTermino) < new Date()
  ).length;

  const actividadesProximasVencer = actividades.filter(act => {
    const diffDays = Math.ceil((new Date(act.fechaTermino).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Mis Actividades Pendientes
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
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Mis Actividades Pendientes
          </CardTitle>
          
          {/* Estadísticas rápidas */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{actividades.length} pendientes</span>
            </div>
            {actividadesProximasVencer > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-600">{actividadesProximasVencer} próximas a vencer</span>
              </div>
            )}
            {actividadesVencidas > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">{actividadesVencidas} vencidas</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {actividades.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium">¡Todas las tareas completadas!</h3>
              <p className="text-muted-foreground">No hay actividades pendientes.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {actividades.map((actividad) => {
                const fechaVencimiento = new Date(actividad.fechaTermino);
                const esVencida = fechaVencimiento < new Date();
                const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={actividad.id}
                    className={`border-l-4 bg-card p-4 rounded-md shadow-sm ${getPriorityColor(actividad.fechaTermino)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                            <Calendar className="h-3 w-3" />
                            <span className={esVencida ? 'text-red-600 font-medium' : ''}>
                              Vence: {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                              {!esVencida && diasRestantes <= 7 && (
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
                        
                        <Button
                          onClick={() => handleOpenCloseDialog(actividad)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {actividades.length === 10 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => window.open('/dashboard/todo', '_blank')}>
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
            <DialogTitle>Detalles de la Actividad</DialogTitle>
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

      {/* Modal de cierre */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Completar Actividad</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{actividadToClose?.tipoActividad.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                RUC: {actividadToClose?.causa.ruc}
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="glosa-cierre" className="text-sm font-medium">
                Comentarios de Cierre (Opcional)
              </label>
              <Textarea
                id="glosa-cierre"
                placeholder="Describe cómo se completó la actividad..."
                value={glosaCierre}
                onChange={(e) => setGlosaCierre(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              <strong>Fecha de cierre:</strong> {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCloseDialog(false);
                setActividadToClose(null);
                setGlosaCierre('');
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivityClose}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Completar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}