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
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import CausaSelector from '@/components/select/CausaSelector';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Schema actualizado con delegación
const ActividadSchema = z
  .object({
    causaId: z.string().min(1, 'Debe seleccionar una causa'),
    tipoActividadId: z.string().min(1, 'Debe seleccionar un tipo de actividad'),
    fechaInicio: z.string().min(1, 'Debe seleccionar una fecha de inicio'),
    fechaTermino: z.string().min(1, 'Debe seleccionar una fecha de término'),
    observacion: z.string().optional(),
    estado: z.enum(['inicio', 'en_proceso', 'terminado']),
    usuarioAsignadoId: z.string().optional()
  })
  .refine((data) => data.fechaTermino >= data.fechaInicio, {
    message: 'La fecha de término debe ser posterior a la fecha de inicio',
    path: ['fechaTermino']
  });

interface TipoActividad {
  id: number;
  nombre: string;
  activo: boolean;
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
  };
}

// 🔥 COMPONENTE DE DELEGACIÓN SEPARADO - Solo cliente
const DelegationField = ({ field, userRole }: { field: any; userRole: number | null }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('/api/usuarios?roles=2,3,4');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error:', error);
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

// 🔥 COMPONENTE DINÁMICO - Solo se renderiza en cliente
const DynamicDelegationField = dynamic(
  () => Promise.resolve(DelegationField),
  { 
    ssr: false,
    loading: () => <div className="h-20 flex items-center text-sm text-muted-foreground">Cargando opciones de delegación...</div>
  }
);

export default function ActividadForm({
  onSubmit,
  isSubmitting,
  initialData
}: ActividadFormProps) {
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [isLoadingTipos, setIsLoadingTipos] = useState(true);
  const [userRole, setUserRole] = useState<number | null>(null);

  const form = useForm<ActividadFormValues>({
    resolver: zodResolver(ActividadSchema),
    defaultValues: initialData || {
      causaId: '',
      tipoActividadId: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaTermino: new Date().toISOString().split('T')[0],
      estado: 'inicio',
      observacion: '',
      usuarioAsignadoId: ''
    }
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [form, initialData]);

  // Obtener rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/usuarios/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.rolId);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserRole();
  }, []);

  // Cargar tipos de actividad
  useEffect(() => {
    const fetchTiposActividad = async () => {
      try {
        const response = await fetch('/api/tipos-actividad');
        if (!response.ok) throw new Error('Error al cargar tipos de actividad');

        const data = await response.json();
        setTiposActividad(data.filter((tipo: TipoActividad) => tipo.activo));
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los tipos de actividad');
      } finally {
        setIsLoadingTipos(false);
      }
    };

    fetchTiposActividad();
  }, []);

  // Verificar si puede delegar
  const canDelegate = userRole === 1 || userRole === 4;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="tipoActividadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Actividad</FormLabel>
                  <Select
                    disabled={isLoadingTipos}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposActividad.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 🔥 CAMPO DE DELEGACIÓN - SOLUCIÓN SIMPLE SIN HIDRATACIÓN */}
            {canDelegate && (
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="observacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observación</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
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