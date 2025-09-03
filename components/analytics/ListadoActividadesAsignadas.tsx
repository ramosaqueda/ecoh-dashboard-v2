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
  XCircle,
  MoreHorizontal,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const getPriorityLevel = (fechaTermino: string, estado: string) => {
  if (estado === 'terminado') return 'completada';
  
  const today = new Date();
  const termino = new Date(fechaTermino);
  const diffDays = Math.ceil((termino.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'vencida';
  if (diffDays <= 3) return 'urgente';
  if (diffDays <= 7) return 'proxima';
  return 'normal';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'vencida': return 'bg-red-50 border-l-red-500';
    case 'urgente': return 'bg-orange-50 border-l-orange-500';
    case 'proxima': return 'bg-yellow-50 border-l-yellow-500';
    case 'completada': return 'bg-green-50 border-l-green-500';
    default: return 'bg-blue-50 border-l-blue-500';
  }
};

export default function ListadoActividadesAsignadas() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState<Actividad[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [actividadDetail, setActividadDetail] = useState<Actividad | null>(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [filtroRuc, setFiltroRuc] = useState<string>('');

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
      params.append('limit', '500');
      params.append('include_assigned', 'true');
      
      const url = `/api/actividades?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      // Filtrar actividades asignadas por el usuario actual a otros usuarios
      const actividadesAsignadas = data.filter((actividad: any) => {
        return actividad.usuario?.id === currentUser.id && 
               actividad.usuarioAsignado && 
               actividad.usuarioAsignado.id !== currentUser.id;
      });
      
      // Ordenar por fecha de término y luego por estado
      actividadesAsignadas.sort((a: any, b: any) => {
        // Primero las vencidas y urgentes
        const priorityA = getPriorityLevel(a.fechaTermino, a.estado);
        const priorityB = getPriorityLevel(b.fechaTermino, b.estado);
        
        const priorityOrder = { 'vencida': 0, 'urgente': 1, 'proxima': 2, 'normal': 3, 'completada': 4 };
        const orderA = priorityOrder[priorityA as keyof typeof priorityOrder] || 5;
        const orderB = priorityOrder[priorityB as keyof typeof priorityOrder] || 5;
        
        if (orderA !== orderB) return orderA - orderB;
        
        return new Date(a.fechaTermino).getTime() - new Date(b.fechaTermino).getTime();
      });
      
      setActividades(actividadesAsignadas);
      setActividadesFiltradas(actividadesAsignadas);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades asignadas');
      setActividades([]);
      setActividadesFiltradas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    let filtered = [...actividades];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(act => act.estado === filtroEstado);
    }

    // Filtro por usuario asignado
    if (filtroUsuario.trim()) {
      filtered = filtered.filter(act => 
        (act.usuarioAsignado?.nombre?.toLowerCase().includes(filtroUsuario.toLowerCase())) ||
        (act.usuarioAsignado?.email?.toLowerCase().includes(filtroUsuario.toLowerCase()))
      );
    }

    // Filtro por RUC
    if (filtroRuc.trim()) {
      filtered = filtered.filter(act => 
        act.causa.ruc.toLowerCase().includes(filtroRuc.toLowerCase())
      );
    }

    setActividadesFiltradas(filtered);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroUsuario('');
    setFiltroRuc('');
    setActividadesFiltradas(actividades);
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

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, filtroUsuario, filtroRuc, actividades]);

  // Estadísticas del listado
  const totalAsignadas = actividades.length;
  const completadas = actividades.filter(act => act.estado === 'terminado').length;
  const enProceso = actividades.filter(act => act.estado === 'en_proceso').length;
  const porIniciar = actividades.filter(act => act.estado === 'inicio').length;
  const vencidas = actividades.filter(act => 
    act.estado !== 'terminado' && new Date(act.fechaTermino) < new Date()
  ).length;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Actividades Asignadas por Mí
            </CardTitle>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActividadesAsignadas}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{totalAsignadas} total</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{completadas} completadas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">{enProceso} en proceso</span>
            </div>
            {vencidas > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">{vencidas} vencidas</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="inicio">Por Iniciar</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="terminado">Completadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Usuario Asignado</label>
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">RUC</label>
                <Input
                  placeholder="Buscar por RUC..."
                  value={filtroRuc}
                  onChange={(e) => setFiltroRuc(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  size="sm"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando actividades asignadas...</span>
            </div>
          ) : actividadesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              {actividades.length === 0 ? (
                <>
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No hay actividades asignadas</h3>
                  <p className="text-muted-foreground">Aún no has asignado actividades a otros usuarios.</p>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No se encontraron resultados</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabla para desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Asignado a</TableHead>
                      <TableHead>Causa</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actividadesFiltradas.map((actividad) => {
                      const priority = getPriorityLevel(actividad.fechaTermino, actividad.estado);
                      const fechaVencimiento = new Date(actividad.fechaTermino);
                      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <TableRow 
                          key={actividad.id} 
                          className={`${getPriorityColor(priority)} border-l-4`}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {getStatusIcon(actividad.estado)}
                                {actividad.tipoActividad.nombre}
                              </div>
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
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-600" />
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {actividad.usuarioAsignado?.nombre || actividad.usuarioAsignado?.email}
                                </div>
                                {actividad.usuarioAsignado?.rol && (
                                  <div className="text-xs text-muted-foreground">
                                    {actividad.usuarioAsignado.rol.nombre}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{actividad.causa.ruc}</div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
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
                            {getEstadoBadge(actividad.estado)}
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                              </div>
                              {actividad.estado !== 'terminado' && (
                                <div className={`text-xs ${
                                  priority === 'vencida' ? 'text-red-600 font-medium' :
                                  priority === 'urgente' ? 'text-orange-600 font-medium' :
                                  'text-gray-500'
                                }`}>
                                  {priority === 'vencida' ? `${Math.abs(diasRestantes)} días vencida` :
                                   diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Vence hoy'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                actividad.estado === 'terminado' ? 'bg-green-500' :
                                actividad.estado === 'en_proceso' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <span className="text-xs text-muted-foreground">
                                {actividad.estado === 'terminado' ? 'Completado' :
                                 actividad.estado === 'en_proceso' ? 'En progreso' :
                                 'No iniciado'}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenDetailDialog(actividad)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Contactar usuario
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Ir a actividad
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Vista móvil */}
              <div className="md:hidden space-y-3">
                {actividadesFiltradas.map((actividad) => {
                  const priority = getPriorityLevel(actividad.fechaTermino, actividad.estado);
                  const fechaVencimiento = new Date(actividad.fechaTermino);
                  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={actividad.id}
                      className={`border-l-4 bg-card p-4 rounded-md shadow-sm ${getPriorityColor(priority)}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(actividad.estado)}
                              <h4 className="font-medium text-sm truncate">
                                {actividad.tipoActividad.nombre}
                              </h4>
                              {getEstadoBadge(actividad.estado)}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailDialog(actividad)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{actividad.causa.ruc}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{actividad.usuarioAsignado?.nombre || actividad.usuarioAsignado?.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Vence: {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            priority === 'vencida' ? 'text-red-600 font-medium' :
                            priority === 'urgente' ? 'text-orange-600 font-medium' :
                            'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            <span>
                              {priority === 'vencida' ? `${Math.abs(diasRestantes)} días vencida` :
                               diasRestantes > 0 ? `${diasRestantes} días` : 'Hoy'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen al final */}
              <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
                Mostrando {actividadesFiltradas.length} de {totalAsignadas} actividades asignadas
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles de Actividad Asignada</DialogTitle>
          </DialogHeader>
          
          {actividadDetail && (
            <div className="space-y-6">
              {/* Header del detalle */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{actividadDetail.tipoActividad.nombre}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    ID: {actividadDetail.id} • Creada: {format(new Date(actividadDetail.createdAt || actividadDetail.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
                {getEstadoBadge(actividadDetail.estado)}
              </div>
              
              {/* Información de la causa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Información de la Causa</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">RUC:</label>
                    <p>{actividadDetail.causa.ruc}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-gray-700">Denominación:</label>
                    <p>{actividadDetail.causa.denominacionCausa}</p>
                  </div>
                </div>
              </div>
              
              {/* Información del usuario asignado */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Usuario Responsable
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">Nombre:</label>
                    <p>{actividadDetail.usuarioAsignado?.nombre || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Email:</label>
                    <p>{actividadDetail.usuarioAsignado?.email}</p>
                  </div>
                  {actividadDetail.usuarioAsignado?.rol && (
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700">Rol:</label>
                      <p>{actividadDetail.usuarioAsignado.rol.nombre}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fechas y estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                  <p className="text-sm">{format(new Date(actividadDetail.fechaInicio), 'dd/MM/yyyy', { locale: es })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                  <p className="text-sm">{format(new Date(actividadDetail.fechaTermino), 'dd/MM/yyyy', { locale: es })}</p>
                </div>
              </div>
              
              {/* Descripción */}
              {actividadDetail.observacion && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción de la Actividad</label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md border">{actividadDetail.observacion}</p>
                </div>
              )}
              
              {/* Comentarios de cierre */}
              {actividadDetail.glosa_cierre && actividadDetail.estado === 'terminado' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Comentarios de Cierre</label>
                  <p className="text-sm mt-1 bg-green-50 p-3 rounded-md border border-green-200">{actividadDetail.glosa_cierre}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => window.open(`/dashboard/actividades?id=${actividadDetail?.id}`, '_blank')}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Ir a Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}