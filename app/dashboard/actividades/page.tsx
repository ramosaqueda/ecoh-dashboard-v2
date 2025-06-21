'use client';

import { useState, useEffect, useCallback } from 'react';
import ActividadForm from '@/components/forms/actividad/ActividadForm';
import { ActividadesTable } from '@/components/tables/actividades-tables/ActividadesTable';
import { columns } from '@/components/tables/actividades-tables/columns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import { Plus, Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

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
  glosa_cierre?: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  usuarioAsignado?: {
    id: number;
    nombre: string;
    email: string;
    rol: {
      id: number;
      nombre: string;
    };
  };
}

interface ActividadFormData {
  id?: number;
  causaId: string;
  tipoActividadId: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  observacion?: string;
  glosa_cierre?: string;
  usuarioAsignadoId?: string;
}

interface Area {
  id: number;
  nombre: string;
}

interface TipoActividad {
  id: number;
  nombre: string;
  areaId: number;
  area?: Area;
}

interface TipoActividadGrouped {
  area: Area;
  tipos: TipoActividad[];
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface ActividadesResponse {
  data: Actividad[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

interface CurrentUser {
  id: number;
  nombre: string;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
}

// Componente para filtro agrupado
const GroupedTipoActividadFilter = ({ 
  value, 
  onValueChange, 
  tiposAgrupados 
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  tiposAgrupados: TipoActividadGrouped[];
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Filtrar por tipo de actividad" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectItem value="all">Todas las actividades</SelectItem>
        <SelectSeparator />
        
        {tiposAgrupados.map((grupo, groupIndex) => (
          <div key={grupo.area.id}>
            {groupIndex > 0 && <SelectSeparator />}
            
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
              📂 {grupo.area.nombre}
            </div>
            
            {grupo.tipos.map((tipo) => (
              <SelectItem 
                key={tipo.id} 
                value={tipo.id.toString()}
                className="pl-6"
              >
                {tipo.nombre}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [tiposAgrupados, setTiposAgrupados] = useState<TipoActividadGrouped[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  // Estados para filtros
  const [tipoActividadFilter, setTipoActividadFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [usuarioAsignadoFilter, setUsuarioAsignadoFilter] = useState<string>('all');
  
  const [actividadEditing, setActividadEditing] = useState<ActividadFormData | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [pageCount, setPageCount] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Función para agrupar tipos de actividad por área
  const groupTiposByArea = useCallback((tipos: TipoActividad[]): TipoActividadGrouped[] => {
    const grouped = tipos.reduce((acc, tipo) => {
      const areaId = tipo.areaId;
      if (!acc[areaId]) {
        acc[areaId] = {
          area: tipo.area || { id: areaId, nombre: `Área ${areaId}` },
          tipos: []
        };
      }
      acc[areaId].tipos.push(tipo);
      return acc;
    }, {} as Record<number, TipoActividadGrouped>);

    return Object.values(grouped).sort((a, b) => a.area.id - b.area.id);
  }, []);

  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (response.ok) {
        const userData = await response.json();
        // Buscar el rol del usuario
        const userWithRole = await fetch('/api/usuarios/roles');
        if (userWithRole.ok) {
          const usersWithRoles = await userWithRole.json();
          const currentUserWithRole = usersWithRoles.find((u: any) => u.id === userData.id);
          if (currentUserWithRole) {
            setCurrentUser({
              id: userData.id,
              nombre: userData.nombre,
              email: userData.email,
              rol: currentUserWithRole.rol
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  };

  const fetchUsuarios = async (): Promise<void> => {
    try {
      const response = await fetch('/api/usuarios');
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const fetchTiposActividad = async (): Promise<void> => {
    try {
      const response = await fetch('/api/tipos-actividad');
      if (!response.ok) throw new Error('Error al cargar tipos de actividad');
      const data: TipoActividad[] = await response.json();
      
      setTiposActividad(data);
      const grouped = groupTiposByArea(data);
      setTiposAgrupados(grouped);
      
    } catch (error) {
      toast.error('Error al cargar los tipos de actividad');
    }
  };

  const fetchActividades = async (
    tipoId?: string, 
    estado?: string, 
    usuarioAsignadoId?: string, 
    pageNum: number = 1
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (tipoId && tipoId !== 'all') {
        params.append('tipo_actividad_id', tipoId);
      }

      if (estado && estado !== 'all') {
        params.append('estado', estado);
      }

      if (usuarioAsignadoId && usuarioAsignadoId !== 'all') {
        params.append('usuario_asignado_id', usuarioAsignadoId);
      }

      params.append('page', pageNum.toString());
      params.append('limit', pageSize.toString());
      params.append('include_assigned', 'true');

      const url = `/api/actividades?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar actividades');
      const result: ActividadesResponse = await response.json();
      
      setTotalRecords(result.metadata.total);
      setPageCount(Math.ceil(result.metadata.total / pageSize));
      setActividades(result.data);
    } catch (error) {
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchTiposActividad();
    fetchUsuarios();
    fetchActividades();
  }, []);

  const handleSubmit = useCallback(async (data: ActividadFormData): Promise<void> => {
    if (isSubmitting || !dialogOpen) return;

    setIsSubmitting(true);

    try {
      const url = actividadEditing?.id
        ? `/api/actividades?id=${actividadEditing.id}`
        : '/api/actividades';

      const method = actividadEditing?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      setPageIndex(1);
      await fetchActividades(tipoActividadFilter, estadoFilter, usuarioAsignadoFilter, 1);
      
      const successMessage = actividadEditing?.id
        ? 'Actividad actualizada exitosamente'
        : 'Actividad creada exitosamente';
      
      toast.success(successMessage);
      setDialogOpen(false);
      setActividadEditing(undefined);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar la actividad: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [actividadEditing, isSubmitting, dialogOpen, tipoActividadFilter, estadoFilter, usuarioAsignadoFilter]);

  const handleClearFilters = (): void => {
    setTipoActividadFilter('all');
    setEstadoFilter('all');
    setUsuarioAsignadoFilter('all');
    setPageIndex(1);
    fetchActividades(undefined, undefined, undefined, 1);
  };

  const applyFilters = (): void => {
    setPageIndex(1);
    fetchActividades(tipoActividadFilter, estadoFilter, usuarioAsignadoFilter, 1);
  };

  const handleEdit = (actividad: Actividad): void => {
    const editData: ActividadFormData = {
      id: actividad.id,
      causaId: actividad.causa.id.toString(),
      tipoActividadId: actividad.tipoActividad.id.toString(),
      fechaInicio: actividad.fechaInicio.split('T')[0],
      fechaTermino: actividad.fechaTermino.split('T')[0],
      estado: actividad.estado,
      observacion: actividad.observacion,
      glosa_cierre: actividad.glosa_cierre,
      usuarioAsignadoId: actividad.usuarioAsignado?.id.toString()
    };
    setActividadEditing(editData);
    setDialogOpen(true);
  };

  const handleDelete = (id: number): void => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/actividades?id=${deleteId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      
      setPageIndex(1);
      await fetchActividades(tipoActividadFilter, estadoFilter, usuarioAsignadoFilter, 1);
      toast.success('Actividad eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la actividad');
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  const handlePageChange = (newPage: number): void => {
    setPageIndex(newPage);
    fetchActividades(tipoActividadFilter, estadoFilter, usuarioAsignadoFilter, newPage);
  };

  const handleViewTodos = (actividadId: number): void => {
    console.log('Ver tareas de la actividad:', actividadId);
    // Aquí puedes implementar la lógica para abrir un modal o navegar a una página de tareas
    // Ejemplo: router.push(`/actividades/${actividadId}/tareas`);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = tipoActividadFilter !== 'all' || estadoFilter !== 'all' || usuarioAsignadoFilter !== 'all';

  // Mostrar filtro de asignado solo para rol 4
  const canViewAssignedFilter = currentUser?.rol?.id === 4;

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'inicio', label: 'Inicio' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'terminado', label: 'Terminado' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Actividades</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setActividadEditing(undefined);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {actividadEditing ? 'Editar Actividad' : 'Nueva Actividad'}
              </DialogTitle>
            </DialogHeader>
            <ActividadForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={actividadEditing}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sección de filtros */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Filtro por tipo de actividad */}
          <GroupedTipoActividadFilter
            value={tipoActividadFilter}
            onValueChange={setTipoActividadFilter}
            tiposAgrupados={tiposAgrupados}
          />

          {/* Filtro por estado */}
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {estadoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por usuario asignado (solo para rol 4) */}
          {canViewAssignedFilter && (
            <Select value={usuarioAsignadoFilter} onValueChange={setUsuarioAsignadoFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por asignado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botones de acción */}
          <Button onClick={applyFilters} variant="default">
            Aplicar Filtros
          </Button>

          {hasActiveFilters && (
            <Button onClick={handleClearFilters} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Mostrar filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {tipoActividadFilter !== 'all' && (
              <Badge variant="secondary">
                Tipo: {tiposActividad.find(t => t.id.toString() === tipoActividadFilter)?.nombre}
              </Badge>
            )}
            {estadoFilter !== 'all' && (
              <Badge variant="secondary">
                Estado: {estadoOptions.find(e => e.value === estadoFilter)?.label}
              </Badge>
            )}
            {usuarioAsignadoFilter !== 'all' && canViewAssignedFilter && (
              <Badge variant="secondary">
                Asignado: {usuarios.find(u => u.id.toString() === usuarioAsignadoFilter)?.nombre}
              </Badge>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente la actividad
              y los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="text-center">Cargando actividades...</div>
      ) : (
        <ActividadesTable
          columns={columns}
          data={actividades}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewTodos={handleViewTodos}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageCount={pageCount}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}