'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Mail } from 'lucide-react';
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
  usuario?: {
    email?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyUserActivities, setShowOnlyUserActivities] = useState(false);
  const [selectedCausaId, setSelectedCausaId] = useState('');

  // Esta función mapea posibles variaciones de estado a los valores válidos
  const mapearEstado = (estado: string): 'inicio' | 'en_proceso' | 'terminado' => {
    const estadoLower = String(estado).toLowerCase();
    
    if (estadoLower.includes('proceso') || estadoLower.includes('progress')) {
      return 'en_proceso';
    } else if (estadoLower.includes('termin') || estadoLower.includes('done') || estadoLower.includes('complet')) {
      return 'terminado';
    } else {
      return 'inicio'; // Valor por defecto
    }
  };

  // Función para transformar y validar los datos de actividades
  const transformarActividades = (actividadesRaw: any[]) => {
    if (!Array.isArray(actividadesRaw)) {
      console.error('No se recibió un array de actividades:', actividadesRaw);
      return [];
    }
    
    return actividadesRaw.map(act => {
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
        usuario: {
          email: act.usuario?.email || act.assignedTo || undefined
        }
      };
      
      return actividad;
    });
  };

  const fetchActividades = async (onlyUser: boolean = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000'); // Solicitamos todas las actividades
      
      const url = onlyUser 
        ? `/api/actividades/usuario?${params.toString()}` 
        : `/api/actividades?${params.toString()}`;
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      console.log('API Response:', jsonResponse);
      
      // Verificar la estructura de la respuesta
      const data = jsonResponse.data || [];
      
      // Transformar y validar los datos
      const actividadesTransformadas = transformarActividades(data);
      console.log('Actividades transformadas:', actividadesTransformadas);
      
      setActividades(actividadesTransformadas);
      filterActividades(actividadesTransformadas, selectedCausaId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades');
      // En caso de error, establecemos arrays vacíos
      setActividades([]);
      setFilteredActividades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActividades = (actividadesList: Actividad[], causaId: string) => {
    // Aseguramos que actividadesList sea un array
    const arrayToFilter = Array.isArray(actividadesList) ? actividadesList : [];
    console.log('Filtering actividades. Total count:', arrayToFilter.length);
    console.log('Selected Causa ID:', causaId);
    
    if (!causaId) {
      setFilteredActividades(arrayToFilter);
      return;
    }
    
    const filtered = arrayToFilter.filter(
      actividad => actividad.causa && actividad.causa.id && 
      actividad.causa.id.toString() === causaId
    );
    console.log('Filtered actividades count:', filtered.length);
    setFilteredActividades(filtered);
  };

  useEffect(() => {
    console.log('Effect triggered - showOnlyUserActivities:', showOnlyUserActivities);
    fetchActividades(showOnlyUserActivities);
  }, [showOnlyUserActivities]);

  useEffect(() => {
    console.log('Effect triggered - selectedCausaId:', selectedCausaId);
    filterActividades(actividades, selectedCausaId);
  }, [selectedCausaId]);

  const actividadesPorEstado = (estado: string) => {
    // Aseguramos que filteredActividades sea un array
    if (!Array.isArray(filteredActividades)) {
      console.error('filteredActividades no es un array:', filteredActividades);
      return [];
    }
    
    // Verificar valores de estado en las actividades
    console.log('Estados en las actividades:', 
      [...new Set(filteredActividades.map(a => a.estado))]);
    
    // Mostrar una muestra de las actividades para inspección
    if (filteredActividades.length > 0) {
      console.log('Muestra de actividad:', JSON.stringify(filteredActividades[0], null, 2));
    }
    
    // Filtrado más tolerante
    const actividades = filteredActividades.filter((actividad) => {
      // Si hay un problema con la propiedad estado, lo registramos
      if (!actividad.estado) {
        console.warn('Actividad sin estado:', actividad);
        return false;
      }
      
      // Convertimos ambos a string para comparar de forma más segura
      const actividadEstado = String(actividad.estado).toLowerCase();
      const estadoComparar = String(estado).toLowerCase();
      
      // Verificamos si coinciden exactamente o si contienen el texto
      const coincide = actividadEstado === estadoComparar || 
                      actividadEstado.includes(estadoComparar);
      
      return coincide;
    });
    
    console.log(`Actividades en estado ${estado}:`, actividades.length);
    return actividades;
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newEstado = destination.droppableId;
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

      setActividades((prevActividades) => {
        const updatedActividades = prevActividades.map((actividad) =>
          actividad.id === actividadId
            ? { ...actividad, estado: newEstado }
            : actividad
        );
        filterActividades(updatedActividades, selectedCausaId);
        return updatedActividades;
      });

      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el estado');
      fetchActividades(showOnlyUserActivities);
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
                Ver solo mis actividades
              </label>
              <Switch
                id="user-activities"
                checked={showOnlyUserActivities}
                onCheckedChange={(value) => {
                  console.log('Switch changed to:', value);
                  setShowOnlyUserActivities(value);
                }}
              />
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <CausaSelector
              value={selectedCausaId}
              onChange={(value) => setSelectedCausaId(value)}
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
                          (actividad, index) => (
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
                                    
                                    {/* Sección para mostrar el correo encargado */}
                                    {actividad.usuario?.email && (
                                      <CardFooter className="border-t border-secondary px-3 py-2">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1">
                                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span className="truncate max-w-[180px] text-sm text-muted-foreground">
                                                {actividad.usuario.email}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{actividad.usuario.email}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </CardFooter>
                                    )}
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          )
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