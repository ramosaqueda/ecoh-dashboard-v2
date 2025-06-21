// components/forms/VictimaForm/index.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import NacionalidadSelect from '@/components/select/NacionalidadSelect';
import CausaVictimaContainer from '@/components/forms/CausaVictimaForm/CausaVictimaContainer';
import { Separator } from '@/components/ui/separator';
import { CausaVictima } from '@/types/victima';
import { CausasVictimasGrid } from '@/components/forms/VictimaForm/CausasVictimasGrid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRunValidation } from '@/hooks/useRunValidation';
import { formatRun, validateRun } from '@/utils/runValidator';

const VictimaFormSchema = z.object({
  nombreVictima: z.string().min(1, 'El nombre es requerido'),
  docId: z
    .string()
    .min(1, 'El documento de identidad es requerido')
    .refine((val) => validateRun(val), {
      message: 'RUN inválido'
    }),
  nacionalidadId: z.string().min(1, 'La nacionalidad es requerida'),
  alias: z.string().optional(),
  caracteristicas: z.string().optional()
});

export type VictimaFormValues = z.infer<typeof VictimaFormSchema>;

export interface VictimaFormProps {
  initialValues?: Partial<VictimaFormValues>;
  onSubmit: (data: VictimaFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  victimaId?: string;
  onSuccess?: () => void;
}

const VictimaForm = ({
  initialValues,
  onSubmit,
  isSubmitting,
  isEditing,
  victimaId,
  onSuccess
}: VictimaFormProps) => {
  const queryClient = useQueryClient();

  console.log('VictimaForm render:', { isEditing, victimaId });

  // 🔥 QUERY ACTUALIZADA: Nueva ruta simple /api/causas-victimas/[victimaId]
  const { data: causasAsociadas = [], refetch: refetchCausas, isLoading: isLoadingCausas } = useQuery<CausaVictima[]>({
    queryKey: ['causas-victimas', victimaId],
    queryFn: async () => {
      if (!victimaId) return [];
      console.log('🔍 Cargando causas para víctima:', victimaId);
      
      // Nueva ruta simple siguiendo el patrón de causas-imputados
      const response = await fetch(`/api/causas-victimas/${victimaId}`);
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error al cargar causas:', error);
        throw new Error(error.message || 'Error al cargar las causas asociadas');
      }
      const data = await response.json();
      console.log('✅ Causas cargadas:', data.length, 'causas');
      return data;
    },
    enabled: !!victimaId && isEditing,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });

  const form = useForm<VictimaFormValues>({
    resolver: zodResolver(VictimaFormSchema),
    defaultValues: {
      nombreVictima: '',
      docId: '',
      nacionalidadId: '',
      alias: '',
      caracteristicas: '',
      ...initialValues
    }
  });

  const isFormDirty = Object.keys(form.formState.dirtyFields).length > 0;

  // Función que se ejecuta cuando se asocia exitosamente una causa
  const handleCausaSuccess = async () => {
    console.log('✅ Causa asociada exitosamente, refrescando queries...');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['causas-victimas', victimaId] }),
      queryClient.invalidateQueries({ queryKey: ['victimas'] }),
      queryClient.invalidateQueries({ queryKey: ['victima', victimaId] })
    ]);
    onSuccess?.();
  };

  const { isValid, error, formatRun, validateRun } = useRunValidation();

  const handleRunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRun = formatRun(e.target.value);
    form.setValue('docId', formattedRun);
    validateRun(formattedRun);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nombreVictima"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese el nombre completo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="docId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUN</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={handleRunChange}
                    placeholder="12.345.678-9"
                  />
                </FormControl>
                {error && (
                  <span className="text-sm text-destructive">{error}</span>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nacionalidadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad</FormLabel>
                <FormControl>
                  <NacionalidadSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    error={form.formState.errors.nacionalidadId?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingrese alias conocidos" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caracteristicas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Características</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Ingrese características físicas o distintivas separadas por coma"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting || !isFormDirty}
            >
              Cancelar
            </Button>
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

      {/* Sección de Causas - Solo visible en modo edición */}
      {isEditing && victimaId && (
        <>
          <Separator />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Causas Asociadas</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona las causas asociadas a esta víctima
                </p>
              </div>
              <CausaVictimaContainer
                victimaId={victimaId}
                onSuccess={handleCausaSuccess}
                trigger={
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Asociar Causa
                  </Button>
                }
              />
            </div>
            
            {/* Información de debug (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                <strong>Debug:</strong> Víctima ID: {victimaId} | Causas cargadas: {causasAsociadas.length} | Loading: {isLoadingCausas ? 'Sí' : 'No'}
              </div>
            )}
            
            {/* Grid de causas asociadas con loading state */}
            <CausasVictimasGrid 
              causas={causasAsociadas} 
              victimaId={victimaId}
              isLoading={isLoadingCausas}
            />
          </div>

          <Separator />
        </>
      )}
    </div>
  );
};

export default VictimaForm;