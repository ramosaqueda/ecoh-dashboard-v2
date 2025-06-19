'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// ✅ Definir tipos basados en el schema de Prisma
interface CausaBasica {
  id: number;
  ruc: string;
  denominacionCausa: string;
}

interface TipoActividadBasica {
  id: number;
  nombre: string;
}

interface UsuarioBasica {
  id: number;
  email: string;
  nombre: string;
}

// ✅ Tipo para la actividad que viene del API (con relaciones incluidas)
interface ActividadAPI {
  id: number;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  fechaInicio: string;
  fechaTermino: string;
  observacion?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales (pueden venir o no del API)
  causa?: CausaBasica;
  tipoActividad?: TipoActividadBasica;
  usuario?: UsuarioBasica;
}

// ✅ Tipo para la actividad normalizada (estructura garantizada)
interface ActividadNormalizada {
  id: number;
  estado: 'inicio' | 'en_proceso' | 'terminado';
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
}

// ✅ Tipos para el estado del kanban
interface EstadoKanban {
  id: 'inicio' | 'en_proceso' | 'terminado';
  label: string;
  color: string;
}

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Kanban Actividades', link: '/dashboard/actividades-kanban' }
];

// Estos son los estados que espera el componente
const estados: EstadoKanban[] = [
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

export default function ActividadesKanbanSimple() {
  const [actividades, setActividades] = useState<ActividadNormalizada[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOnlyUserActivities, setShowOnlyUserActivities] = useState<boolean>(false);

  // ✅ Función tipada para normalizar los datos de actividades
  const normalizarActividad = (act: ActividadAPI): ActividadNormalizada => {
    // Siempre devolvemos un objeto con la estructura esperada
    return {
      id: act.id,
      estado: act.estado || 'inicio',
      causa: {
        id: act.causa?.id || 0,
        ruc: act.causa?.ruc || 'Sin RUC',
        denominacionCausa: act.causa?.denominacionCausa || 'Sin denominación'
      },
      tipoActividad: {
        nombre: act.tipoActividad?.nombre || 'Sin tipo'
      },
      fechaInicio: act.fechaInicio || new Date().toISOString(),
      fechaTermino: act.fechaTermino || new Date().toISOString()
    };
  };

  // ✅ Función para cargar actividades con tipos
  const fetchActividades = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const url = showOnlyUserActivities
        ? '/api/actividades/usuario'
        : '/api/actividades';
        
      console.log('Cargando desde:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonData = await response.json();
      console.log('Respuesta del API:', jsonData);
      
      // Obtenemos el array de actividades con tipo
      const dataArray: ActividadAPI[] = jsonData.data || [];
      console.log(`Se encontraron ${dataArray.length} actividades`);
      
      // Normalizamos cada actividad con tipos seguros
      const actividadesNormalizadas: ActividadNormalizada[] = dataArray.map(normalizarActividad);
      console.log('Actividades normalizadas:', actividadesNormalizadas);
      
      setActividades(actividadesNormalizadas);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades');
      setActividades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar actividades cuando cambia el interruptor
  useEffect(() => {
    fetchActividades();
  }, [showOnlyUserActivities]);

  // ✅ Función tipada para filtrar por estado
  const actividadesPorEstado = (estado: EstadoKanban['id']): ActividadNormalizada[] => {
    return actividades.filter(act => act.estado === estado);
  };

  return (
    <PageContainer className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-col space-y-4 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tablero de Actividades (Simplificado)</h1>
            <div className="flex items-center gap-2">
              <label htmlFor="user-activities" className="text-sm text-muted-foreground">
                Ver solo mis actividades
              </label>
              <Switch
                id="user-activities"
                checked={showOnlyUserActivities}
                onCheckedChange={(value: boolean) => {
                  console.log('Switch cambiado a:', value);
                  setShowOnlyUserActivities(value);
                }}
              />
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-medium">Información de diagnóstico:</h2>
            <p>Total de actividades: {actividades.length}</p>
            <p>Por Iniciar: {actividadesPorEstado('inicio').length}</p>
            <p>En Proceso: {actividadesPorEstado('en_proceso').length}</p>
            <p>Terminadas: {actividadesPorEstado('terminado').length}</p>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={() => {}}>
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