'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, FileText } from 'lucide-react';
import CausaSelector from '@/components/select/CausaSelector';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const ActividadSchema = z
  .object({
    causaId: z.string().min(1, 'Debe seleccionar una causa'),
    tipoActividadId: z.string().min(1, 'Debe seleccionar un tipo de actividad'),
    fechaInicio: z.string().min(1, 'Debe seleccionar una fecha de inicio'),
    fechaTermino: z.string().min(1, 'Debe seleccionar una fecha de término'),
    observacion: z.string().optional(),
    estado: z.enum(['inicio', 'en_proceso', 'terminado']),
    usuarioAsignadoId: z.string().optional(),
    glosa_cierre: z.string().optional()
  })
  .refine((data) => data.fechaTermino >= data.fechaInicio, {
    message: 'La fecha de término debe ser posterior a la fecha de inicio',
    path: ['fechaTermino']
  })
  .refine((data) => {
    const requiresGlosa = data.estado === 'terminado';
    const hasGlosa = data.glosa_cierre && data.glosa_cierre.trim().length > 0;
    return !requiresGlosa || hasGlosa;
  }, {
    message: 'La glosa de cierre es requerida cuando la actividad está terminada',
    path: ['glosa_cierre']
  });

// 🆕 Interfaces actualizadas para incluir área
interface Area {
  id: number;
  nombre: string;
}

interface TipoActividad {
  id: number;
  nombre: string;
  activo: boolean;
  areaId: number;
  area?: Area; // Información del área asociada
}

interface TipoActividadGrouped {
  area: Area;
  tipos: TipoActividad[];
}

interface Usuario {
  id: number;
  email: string;
  nombre?: string;
  rol: {
    id: number;
    nombre: string;
  };
}

export type ActividadFormValues = z.infer<typeof ActividadSchema>;

interface ActividadFormProps {
  onSubmit: (data: ActividadFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialData?: {
    id?: number;
    causaId: string;
    tipoActividadId: string;
    fechaInicio: string;
    fechaTermino: string;
    estado: 'inicio' | 'en_proceso' | 'terminado';
    observacion?: string;
    usuarioAsignadoId?: string;
    glosa_cierre?: string;
  };
}

const DelegationField = ({ field, userRole }: { field: any; userRole: number | null }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('/api/usuarios?roles=2,3,4');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(Array.isArray(data) ? data : []);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error cargando usuarios: {error}
      </div>
    );
  }

  return (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Delegar Actividad
      </FormLabel>
      <FormControl>
        <select
          className="w-full p-2 border rounded-md bg-background"
          value={field.value || ""}
          onChange={(e) => field.onChange(e.target.value)}
        >
          <option value="">Sin delegar (yo me haré cargo)</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id.toString()}>
              {usuario.nombre || usuario.email} - {usuario.rol?.nombre || 'Sin rol'}
            </option>
          ))}
        </select>
      </FormControl>
      <p className="text-xs text-muted-foreground">
        Como {userRole === 1 ? 'Admin' : userRole === 4 ? 'Manager' : 'Usuario'}, puedes delegar esta actividad.
      </p>
    </FormItem>
  );
};

const DynamicDelegationField = dynamic(
  () => Promise.resolve(DelegationField),
  { 
    ssr: false,
    loading: () => (
      <div className="h-20 flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Cargando opciones de delegación...
      </div>
    )
  }
);

// 🆕 Componente para renderizar el selector agrupado
const GroupedTipoActividadSelector = ({ 
  field, 
  tiposAgrupados, 
  isLoading 
}: { 
  field: any; 
  tiposAgrupados: TipoActividadGrouped[]; 
  isLoading: boolean; 
}) => {
  return (
    <Select
      disabled={isLoading}
      onValueChange={field.onChange}
      value={field.value}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Seleccione un tipo de actividad" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="max-h-[400px]">
        {tiposAgrupados.map((grupo, groupIndex) => (
          <div key={grupo.area.id}>
            {/* Separador/Header del área */}
            {groupIndex > 0 && <SelectSeparator />}
            
            {/* Header del área - no seleccionable */}
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 border-b border-border/50">
              📂 {grupo.area.nombre}
            </div>
            
            {/* Tipos de actividad del área */}
            {grupo.tipos.map((tipo) => (
              <SelectItem 
                key={tipo.id} 
                value={tipo.id.toString()}
                className="pl-6" // Indentación para mostrar que pertenece al área
              >
                {tipo.nombre}
              </SelectItem>
            ))}
          </div>
        ))}
        
        {tiposAgrupados.length === 0 && !isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No hay tipos de actividad disponibles
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default function ActividadForm({
  onSubmit,
  isSubmitting,
  initialData
}: ActividadFormProps) {
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [tiposAgrupados, setTiposAgrupados] = useState<TipoActividadGrouped[]>([]);
  const [isLoadingTipos, setIsLoadingTipos] = useState(true);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isLoadingUserRole, setIsLoadingUserRole] = useState(true);

  const form = useForm<ActividadFormValues>({
    resolver: zodResolver(ActividadSchema),
    defaultValues: initialData || {
      causaId: '',
      tipoActividadId: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaTermino: new Date().toISOString().split('T')[0],
      estado: 'inicio',
      observacion: '',
      usuarioAsignadoId: '',
      glosa_cierre: ''
    }
  });

  const estadoActual = form.watch('estado');
  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [form, initialData]);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.rolId || userData.rol_id);
      }
    } catch (error) {
      // Silently handle error - continue without delegation
    } finally {
      setIsLoadingUserRole(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  // 🆕 Función para agrupar tipos de actividad por área
  const groupTiposByArea = useCallback((tipos: TipoActividad[]): TipoActividadGrouped[] => {
    // Agrupar por área
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

    // Convertir a array y ordenar por ID de área
    return Object.values(grouped).sort((a, b) => a.area.id - b.area.id);
  }, []);

  useEffect(() => {
    const fetchTiposActividad = async () => {
      try {
        // 🆕 Modificar el endpoint para incluir información del área
        const response = await fetch('/api/tipos-actividad?include_area=true');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const activeTipos = data.filter((tipo: TipoActividad) => tipo.activo);
        
        setTiposActividad(activeTipos);
        
        // 🆕 Agrupar por área
        const grouped = groupTiposByArea(activeTipos);
        setTiposAgrupados(grouped);
        
      } catch (error) {
        toast.error('Error al cargar los tipos de actividad');
      } finally {
        setIsLoadingTipos(false);
      }
    };

    fetchTiposActividad();
  }, [groupTiposByArea]);

  const handleSubmit = useCallback(async (data: ActividadFormValues) => {
    try {
      if (isSubmitting) {
        toast.warning('Ya se está procesando la operación...');
        return;
      }

      const validationResult = ActividadSchema.safeParse(data);
      if (!validationResult.success) {
        validationResult.error.issues.forEach(issue => {
          const fieldName = issue.path.join('.');
          const message = issue.message;
          toast.error(`${fieldName}: ${message}`);
        });
        return;
      }

      await onSubmit(data);
      
    } catch (error) {
      toast.error('Error inesperado en el formulario');
    }
  }, [onSubmit, isSubmitting]);

  const canDelegate = userRole === 1 || userRole === 4;
  const showGlosaCierre = estadoActual === 'terminado';

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData ? 'Editar Actividad' : 'Nueva Actividad'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="causaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Causa</FormLabel>
                  <CausaSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.causaId?.message}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 🆕 Selector agrupado por áreas */}
            <FormField
              control={form.control}
              name="tipoActividadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Actividad</FormLabel>
                  <GroupedTipoActividadSelector
                    field={field}
                    tiposAgrupados={tiposAgrupados}
                    isLoading={isLoadingTipos}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isLoadingUserRole && canDelegate && (
              <FormField
                control={form.control}
                name="usuarioAsignadoId"
                render={({ field }) => (
                  <DynamicDelegationField field={field} userRole={userRole} />
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaTermino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Término</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={form.watch('fechaInicio')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inicio">Inicio</SelectItem>
                      <SelectItem value="en_proceso">En Proceso</SelectItem>
                      <SelectItem value="terminado">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showGlosaCierre && (
              <FormField
                control={form.control}
                name="glosa_cierre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Glosa de Cierre
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Describa los resultados, conclusiones o motivos del cierre de la actividad..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Requerido para actividades terminadas. Describa los resultados obtenidos o motivos del cierre.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="observacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalle de la actividad</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Ingrese detalles generales sobre la actividad que debe realizar..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoadingTipos}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}