'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Mail, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CausaSelector from '@/components/select/CausaSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  observacion?: string;  // 🔥 AGREGADO: Campo observaciones
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
  { title: 'Kanban Actividades', link: '/dashboard/actividades-kanban' }
];

const estados = [
  {
    id: 'inicio',
    label: 'Por Iniciar',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'en_proceso',
    label: 'En Proceso',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'terminado', 
    label: 'Terminado', 
    color: 'bg-green-50 border-green-200' 
  }
];

export default function ActividadesKanban() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [filteredActividades, setFilteredActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOnlyUserActivities, setShowOnlyUserActivities] = useState<boolean>(false);
  const [selectedCausaId, setSelectedCausaId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // 🔥 NUEVO: Usuario actual

  // ✅ Esta función mapea posibles variaciones de estado a los valores válidos
  const mapearEstado = (estado: string): 'inicio' | 'en_proceso' | 'terminado' => {
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('proceso') || estadoLower.includes('progress')) {
      return 'en_proceso';
    }
    
    if (estadoLower.includes('terminado') || estadoLower.includes('complete') || estadoLower.includes('done')) {
      return 'terminado';
    }
    
    // Por defecto, retornar 'inicio'
    return 'inicio';
  };

  // ✅ Función para transformar y validar los datos de actividades
  const transformarActividades = (actividadesRaw: any[]): Actividad[] => {
    if (!Array.isArray(actividadesRaw)) {
      console.error('No se recibió un array de actividades:', actividadesRaw);
      return [];
    }
    
    return actividadesRaw.map((act: any): Actividad => {
      // Vamos a crear un objeto validado asegurándonos que tenga los campos necesarios
      const actividad: Actividad = {
        id: act.id || 0,
        causa: {
          id: act.causa?.id || 0,
          ruc: act.causa?.ruc || 'Sin RUC',
          denominacionCausa: act.causa?.denominacionCausa || act.causa?.denominacion_causa || 'Sin denominación'
        },
        tipoActividad: {
          nombre: act.tipoActividad?.nombre || act.tipo_actividad?.nombre || 'Sin tipo'
        },
        fechaInicio: act.fechaInicio || act.fecha_inicio || new Date().toISOString(),
        fechaTermino: act.fechaTermino || act.fecha_termino || new Date().toISOString(),
        estado: mapearEstado(act.estado || 'inicio'),
        observacion: act.observacion || undefined, // 🔥 AGREGADO: Mapear observaciones
        usuario: {
          id: act.usuario?.id || 0,
          email: act.usuario?.email || undefined,
          nombre: act.usuario?.nombre || undefined
        },
        // 🔥 NUEVO: Mapear usuario asignado
        usuarioAsignado: act.usuarioAsignado ? {
          id: act.usuarioAsignado.id || 0,
          email: act.usuarioAsignado.email || undefined,
          nombre: act.usuarioAsignado.nombre || undefined,
          rol: act.usuarioAsignado.rol ? {
            nombre: act.usuarioAsignado.rol.nombre || 'Sin rol'
          } : undefined
        } : undefined
      };
      
      return actividad;
    });
  };

  // 🔥 NUEVO: Obtener información del usuario actual
  const fetchCurrentUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
        console.log('🔍 Current user ID:', userData.id);
      }
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
    }
  };

  // 🔥 ACTUALIZADO: Función para filtrar actividades por usuario asignado
  const filterByUser = (actividadesList: Actividad[], onlyMyActivities: boolean): Actividad[] => {
    if (!onlyMyActivities || !currentUserId) {
      return actividadesList;
    }

    const myActivities = actividadesList.filter((actividad: Actividad) => {
      // 🔥 NUEVO: Filtrar por usuario ASIGNADO, no por creador
      const assignedUserId = actividad.usuarioAsignado?.id;
      const isAssignedToMe = assignedUserId === currentUserId;
      
      console.log(`Activity ${actividad.id}: assigned to ${assignedUserId}, current user: ${currentUserId}, matches: ${isAssignedToMe}`);
      
      return isAssignedToMe;
    });

    console.log(`📋 Filtered activities: ${myActivities.length}/${actividadesList.length} assigned to current user`);
    return myActivities;
  };

  const fetchActividades = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      params.append('include_assigned', 'true'); // 🔥 NUEVO: Incluir usuario asignado
      
      const url = `/api/actividades?${params.toString()}`;
      
      console.log('🔍 Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      console.log('📥 API Response:', jsonResponse);
      
      const data = jsonResponse.data || [];
      const actividadesTransformadas = transformarActividades(data);
      
      console.log('✅ Actividades transformadas:', actividadesTransformadas.length);
      
      setActividades(actividadesTransformadas);
      
      // 🔥 ACTUALIZADO: Aplicar filtros de usuario y causa
      const filteredByUser = filterByUser(actividadesTransformadas, showOnlyUserActivities);
      filterActividades(filteredByUser, selectedCausaId);
      
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error al cargar las actividades');
      setActividades([]);
      setFilteredActividades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActividades = (actividadesList: Actividad[], causaId: string): void => {
    const arrayToFilter = Array.isArray(actividadesList) ? actividadesList : [];
    console.log('🔍 Filtering actividades. Total count:', arrayToFilter.length);
    console.log('🔍 Selected Causa ID:', causaId);
    
    if (!causaId) {
      setFilteredActividades(arrayToFilter);
      return;
    }
    
    const filtered = arrayToFilter.filter(
      (actividad: Actividad) => actividad.causa && actividad.causa.id && 
      actividad.causa.id.toString() === causaId
    );
    console.log('✅ Filtered actividades count:', filtered.length);
    setFilteredActividades(filtered);
  };

  // 🔥 NUEVO: Effect para cargar usuario actual al inicio
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🔥 ACTUALIZADO: Effect que se ejecuta cuando cambia el filtro de usuario o se carga el usuario actual
  useEffect(() => {
    if (currentUserId !== null) {
      console.log('🔄 Effect triggered - showOnlyUserActivities:', showOnlyUserActivities);
      fetchActividades();
    }
  }, [showOnlyUserActivities, currentUserId]);

  useEffect(() => {
    console.log('🔄 Effect triggered - selectedCausaId:', selectedCausaId);
    // 🔥 ACTUALIZADO: Aplicar filtro de usuario antes del filtro de causa
    const filteredByUser = filterByUser(actividades, showOnlyUserActivities);
    filterActividades(filteredByUser, selectedCausaId);
  }, [selectedCausaId]);

  const actividadesPorEstado = (estado: string): Actividad[] => {
    if (!Array.isArray(filteredActividades)) {
      console.error('filteredActividades no es un array:', filteredActividades);
      return [];
    }
    
    console.log('🔍 Estados en las actividades:', 
      Array.from(new Set(filteredActividades.map((a: Actividad) => a.estado)))
    );

    if (filteredActividades.length > 0) {
      console.log('📋 Muestra de actividad:', JSON.stringify(filteredActividades[0], null, 2));
    }
    
    const actividades = filteredActividades.filter((actividad: Actividad) => {
      if (!actividad.estado) {
        console.warn('⚠️ Actividad sin estado:', actividad);
        return false;
      }
      
      const actividadEstado = actividad.estado.toLowerCase();
      const estadoComparar = estado.toLowerCase();
      
      const coincide = actividadEstado === estadoComparar || 
                      actividadEstado.includes(estadoComparar);
      
      return coincide;
    });
    
    console.log(`📊 Actividades en estado ${estado}:`, actividades.length);
    return actividades;
  };

  // 🔥 NUEVO: Función para obtener información del responsable de la actividad
  const getResponsableInfo = (actividad: Actividad) => {
    // Priorizar usuario asignado, si no existe, mostrar usuario creador
    const responsable = actividad.usuarioAsignado || actividad.usuario;
    
    if (!responsable) return null;
    
    const nombre = responsable.nombre || responsable.email || 'Usuario desconocido';
    const esDelgado = !!actividad.usuarioAsignado;
    
    return {
      nombre,
      email: responsable.email,
      esDelgado,
      rol: actividad.usuarioAsignado?.rol?.nombre
    };
  };

  const handleDragEnd = async (result: any): Promise<void> => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newEstado = destination.droppableId as 'inicio' | 'en_proceso' | 'terminado';
    const actividadId = parseInt(draggableId);

    try {
      const response = await fetch(`/api/actividades?id=${actividadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: newEstado
        })
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');

      setActividades((prevActividades: Actividad[]) => {
        const updatedActividades = prevActividades.map((actividad: Actividad) =>
          actividad.id === actividadId
            ? { ...actividad, estado: newEstado }
            : actividad
        );
        
        // 🔥 ACTUALIZADO: Aplicar filtros después de actualizar
        const filteredByUser = filterByUser(updatedActividades, showOnlyUserActividades);
        filterActividades(filteredByUser, selectedCausaId);
        
        return updatedActividades;
      });

      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error al actualizar el estado');
      fetchActividades();
    }
  };

  return (
    <PageContainer className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-col space-y-4 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tablero de Actividades</h1>
            <div className="flex items-center gap-2">
              <label htmlFor="user-activities" className="text-sm text-muted-foreground">
                Ver solo mis actividades asignadas
              </label>
              <Switch
                id="user-activities"
                checked={showOnlyUserActivities}
                onCheckedChange={(value: boolean) => {
                  console.log('🔄 Switch changed to:', value);
                  setShowOnlyUserActividades(value);
                }}
              />
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <CausaSelector
              value={selectedCausaId}
              onChange={(value: string) => setSelectedCausaId(value)}
            />
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto pb-6">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando actividades...</span>
            </div>
          ) : (
            <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-3">
              {estados.map((estado) => (
                <div key={estado.id} className="flex h-full flex-col">
                  <div className={`sticky top-0 z-10 rounded-t-lg p-4 ${estado.color}`}>
                    <h2 className="font-semibold">{estado.label}</h2>
                    <div className="text-sm text-muted-foreground">
                      {actividadesPorEstado(estado.id).length} actividades
                    </div>
                  </div>

                  <Droppable droppableId={estado.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto rounded-b-lg border-2 ${
                          estado.color
                        } p-2 ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
                      >
                        {actividadesPorEstado(estado.id).map(
                          (actividad: Actividad, index: number) => {
                            const responsableInfo = getResponsableInfo(actividad);
                            
                            return (
                              <Draggable
                                key={actividad.id}
                                draggableId={actividad.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="mb-2"
                                  >
                                    <Card
                                      className={`transition-shadow hover:shadow-md ${
                                        snapshot.isDragging ? 'shadow-lg' : ''
                                      }`}
                                    >
                                      <CardContent className="space-y-2 p-4">
                                        <div className="font-medium">
                                          {actividad.tipoActividad.nombre}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          RUC: {actividad.causa.ruc}
                                        </div>
                                        <div className="line-clamp-2 text-sm text-muted-foreground">
                                          {actividad.causa.denominacionCausa}
                                        </div>
                                        
                                        {/* 🔥 NUEVO: Campo observaciones */}
                                        {actividad.observacion && (
                                          <div className="line-clamp-2 text-xs text-gray-600 bg-gray-50 rounded-sm p-2 border-l-2 border-gray-300">
                                            <span className="font-medium text-gray-700">Observación: </span>
                                            {actividad.observacion}
                                          </div>
                                        )}
                                        
                                        <div className="border-t pt-2 text-xs text-muted-foreground">
                                          <div>
                                            Inicio:{' '}
                                            {format(
                                              new Date(actividad.fechaInicio),
                                              'dd/MM/yyyy',
                                              { locale: es }
                                            )}
                                          </div>
                                          <div>
                                            Término:{' '}
                                            {format(
                                              new Date(actividad.fechaTermino),
                                              'dd/MM/yyyy',
                                              { locale: es }
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                      
                                      {/* 🔥 ACTUALIZADO: Mostrar responsable (usuario asignado o creador) */}
                                      {responsableInfo && (
                                        <CardFooter className="border-t border-secondary px-3 py-2">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger className="flex items-center gap-1 w-full">
                                                {responsableInfo.esDelgado ? (
                                                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                                                ) : (
                                                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                                <div className="flex flex-col items-start flex-1 min-w-0">
                                                  <span className="truncate max-w-[160px] text-sm font-medium">
                                                    {responsableInfo.nombre}
                                                  </span>
                                                  {responsableInfo.esDelgado && responsableInfo.rol && (
                                                    <span className="text-xs text-blue-600">
                                                      {responsableInfo.rol}
                                                    </span>
                                                  )}
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <div className="text-center">
                                                  <p className="font-medium">
                                                    {responsableInfo.esDelgado ? 'Actividad delegada a:' : 'Creado por:'}
                                                  </p>
                                                  <p>{responsableInfo.email}</p>
                                                  {responsableInfo.rol && (
                                                    <p className="text-xs text-muted-foreground">
                                                      Rol: {responsableInfo.rol}
                                                    </p>
                                                  )}
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </CardFooter>
                                      )}
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            );
                          }
                        )}
                        {provided.placeholder}
                        {actividadesPorEstado(estado.id).length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No hay actividades en este estado
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          )}
        </div>
      </DragDropContext>
    </PageContainer>
  );
}