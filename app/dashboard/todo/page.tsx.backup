'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Loader2,
  AlertTriangle,
  UserCheck,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  cargo?: string;
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
  createdAt?: string;
  updatedAt?: string;
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

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Lista de Tareas', link: '/dashboard/todo' }
];

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
  
  if (diffDays < 0) return 'text-red-600'; // Vencida
  if (diffDays <= 3) return 'text-orange-600'; // Próxima a vencer
  return 'text-gray-600'; // Normal
};

export default function TodoActividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Estados para el modal de cierre
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [actividadToClose, setActividadToClose] = useState<Actividad | null>(null);
  const [glosaCierre, setGlosaCierre] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el modal de detalle
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actividadDetail, setActividadDetail] = useState<Actividad | null>(null);

  // Verificar si el usuario actual es manager
  const isManager = currentUser?.rol?.id === 4;

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
          setSelectedUserId(foundUser.id.toString());
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar información del usuario');
    }
  };

  // Obtener usuarios (solo para managers)
  const fetchUsuarios = async () => {
    if (!isManager) return;
    
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/usuarios');
      if (!response.ok) throw new Error('Error al obtener usuarios');
      
      const usersData = await response.json();
      setUsuarios(usersData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Obtener actividades pendientes
  const fetchActividades = async (userId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('include_assigned', 'true');
      
      const url = `/api/actividades?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      // Filtrar actividades pendientes
      let actividadesPendientes = data.filter((actividad: any) => 
        actividad.estado === 'inicio' || actividad.estado === 'en_proceso'
      );
      
      // Filtrar por usuario si se especifica
      if (userId) {
        const userIdNum = parseInt(userId);
        actividadesPendientes = actividadesPendientes.filter((actividad: any) => {
          const assignedUserId = actividad.usuarioAsignado?.id || actividad.usuario?.id;
          return assignedUserId === userIdNum;
        });
      }
      
      // Ordenar por fecha de término (más urgentes primero)
      actividadesPendientes.sort((a: any, b: any) => 
        new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime()
      );
      
      setActividades(actividadesPendientes);
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
      if (isManager) {
        fetchUsuarios();
      }
      fetchActividades(selectedUserId);
    }
  }, [currentUser, selectedUserId]);

  // Estadísticas
  const actividadesVencidas = actividades.filter(act => 
    new Date(act.fechaTermino) < new Date()
  ).length;

  const actividadesProximasVencer = actividades.filter(act => {
    const diffDays = Math.ceil((new Date(act.fechaTermino).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lista de Tareas</h1>
              <p className="text-muted-foreground">
                Gestiona las actividades pendientes
              </p>
            </div>
          </div>

          {/* Selector de usuario para managers */}
          {isManager && (
            <div className="flex items-center gap-4">
              <label htmlFor="user-select" className="text-sm font-medium">
                Ver tareas de:
              </label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoadingUsers}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{usuario.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {usuario.email} • {usuario.cargo || 'Sin cargo'}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{actividades.length}</div>
                    <div className="text-sm text-muted-foreground">Tareas Pendientes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{actividadesProximasVencer}</div>
                    <div className="text-sm text-muted-foreground">Próximas a Vencer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{actividadesVencidas}</div>
                    <div className="text-sm text-muted-foreground">Vencidas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabla de actividades */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando actividades...</span>
              </div>
            ) : actividades.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">¡Todas las tareas completadas!</h3>
                <p className="text-muted-foreground">No hay actividades pendientes en este momento.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Causa</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Asignado por</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actividades.map((actividad) => {
                      const responsable = actividad.usuarioAsignado || actividad.usuario;
                      const fechaVencimiento = new Date(actividad.fechaTermino);
                      const esVencida = fechaVencimiento < new Date();
                      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <TableRow 
                          key={actividad.id} 
                          className={`${esVencida ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-muted/50'}`}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{actividad.tipoActividad.nombre}</div>
                              {actividad.observacion && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {actividad.observacion}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      <p>{actividad.observacion}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{actividad.causa.ruc}</div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {actividad.causa.denominacionCausa}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    <p>{actividad.causa.denominacionCausa}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              {getEstadoBadge(actividad.estado)}
                              {esVencida && (
                                <Badge variant="destructive" className="text-xs block w-fit">
                                  Vencida
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(actividad.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className={`text-sm ${getPriorityColor(actividad.fechaTermino)}`}>
                              {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                              {!esVencida && diasRestantes <= 7 && (
                                <div className="text-xs">
                                  {diasRestantes > 0 ? `${diasRestantes} días` : 'Hoy'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {actividad.usuario && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-600" />
                                <div className="text-sm">
                                  <div className="font-medium truncate max-w-[120px]">
                                    {actividad.usuario.nombre || actividad.usuario.email || 'Usuario desconocido'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {responsable && (
                              <div className="flex items-center gap-2">
                                {actividad.usuarioAsignado ? (
                                  <UserCheck className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="text-sm">
                                  <div className="font-medium truncate max-w-[120px]">
                                    {responsable.nombre || responsable.email}
                                  </div>
                                  {actividad.usuarioAsignado?.rol && (
                                    <div className="text-xs text-muted-foreground">
                                      {actividad.usuarioAsignado.rol.nombre}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
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
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Completar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                
                {(actividadDetail.usuarioAsignado || actividadDetail.usuario) && (
                  <div>
                    <label className="text-sm font-medium">
                      {actividadDetail.usuarioAsignado ? 'Asignado a' : 'Creado por'}
                    </label>
                    <p className="text-sm">
                      {(actividadDetail.usuarioAsignado || actividadDetail.usuario)?.nombre || 
                       (actividadDetail.usuarioAsignado || actividadDetail.usuario)?.email}
                    </p>
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
                  RUC: {actividadToClose?.causa.ruc} - {actividadToClose?.causa.denominacionCausa}
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="glosa-cierre" className="text-sm font-medium">
                  Comentarios de Cierre (Opcional)
                </label>
                <Textarea
                  id="glosa-cierre"
                  placeholder="Describe cómo se completó la actividad o cualquier observación relevante..."
                  value={glosaCierre}
                  onChange={(e) => setGlosaCierre(e.target.value)}
                  rows={4}
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
                    Completar Actividad
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}