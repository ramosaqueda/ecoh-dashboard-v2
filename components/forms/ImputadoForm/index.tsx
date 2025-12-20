'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Camera } from 'lucide-react';
import NacionalidadSelect from '@/components/select/NacionalidadSelect';
import CausaImputadoContainer from '@/components/forms/CausaImputadoForm/CausaImputadoContainer';

import { useRunValidation } from '@/hooks/useRunValidation';

import { Separator } from '@/components/ui/separator';
import { CausaImputado } from '@/types/causaimputado';

import { CausasGrid } from '@/components/forms/ImputadoForm/CausasGrid';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import ImputadoPhotos from '@/components/forms/ImputadoForm/ImputadoPhotos';
import { formatRun, validateRun } from '@/utils/runValidator';

const ImputadoFormSchema = z.object({
  nombreSujeto: z.string().min(1, 'El nombre es requerido'),
  esExtranjero: z.boolean().default(false),
  docId: z.string().min(1, 'El documento de identidad es requerido'),
  nacionalidadId: z.string().min(1, 'La nacionalidad es requerida'),
  alias: z.string().optional(),
  caracteristicas: z.string().optional()
}).superRefine((data, ctx) => {
  if (!data.esExtranjero && !validateRun(data.docId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'RUN inválido',
      path: ['docId'],
    });
  }
});

export type ImputadoFormValues = z.infer<typeof ImputadoFormSchema>;

export interface ImputadoFormProps {
  initialValues?: Partial<ImputadoFormValues>;
  onSubmit: (data: ImputadoFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  imputadoId?: string;
  onSuccess?: () => void;
}

const ImputadoForm = ({
  initialValues,
  onSubmit,
  isSubmitting,
  isEditing,
  imputadoId,
  onSuccess
}: ImputadoFormProps) => {
  const queryClient = useQueryClient();
  const [fotoSujeto, setFotoSujeto] = useState<string | null>(null);
  const [loadingFoto, setLoadingFoto] = useState(false);

  const { data: causasAsociadas = [], refetch: refetchCausas } = useQuery<
    CausaImputado[]
  >({
    queryKey: ['causas-imputados', imputadoId],
    queryFn: async () => {
      if (!imputadoId) return [];
      const response = await fetch(`/api/causas-imputados/${imputadoId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || 'Error al cargar las causas asociadas'
        );
      }
      return response.json();
    },
    enabled: !!imputadoId && isEditing
  });

  const form = useForm<ImputadoFormValues>({
    resolver: zodResolver(ImputadoFormSchema),
    defaultValues: {
      nombreSujeto: '',
      esExtranjero: false,
      docId: '',
      nacionalidadId: '',
      alias: '',
      caracteristicas: '',
      ...initialValues
    }
  });

  const isFormDirty = Object.keys(form.formState.dirtyFields).length > 0;

  const handleCausaSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['causas-imputados', imputadoId]
    });
    onSuccess?.();
  };

  const { isValid, error, formatRun, validateRun } = useRunValidation();

  const fetchFoto = async () => {
    const rut = form.getValues('docId');
    if (!rut) return;

    setLoadingFoto(true);
    try {
      const ciSession = localStorage.getItem('fichab_session');
      const serverId = localStorage.getItem('fichab_serverid');

      if (!ciSession) {
        console.warn('No ci_session found in localStorage');
        setLoadingFoto(false);
        return;
      }

      const responseFoto = await fetch('/api/fichab/foto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut,
          ciSession,
          serverId
        }),
      });

      if (responseFoto.ok) {
        const resultFoto = await responseFoto.json();
        if (resultFoto.success && resultFoto.data) {
          setFotoSujeto(resultFoto.data);
        }
      }
    } catch (error) {
      console.error('Error fetching photo:', error);
    } finally {
      setLoadingFoto(false);
    }
  };

  const fetchPersonalData = async (rut: string) => {
    console.log('fetchPersonalData called with:', rut);
    try {
      const ciSession = localStorage.getItem('fichab_session');
      const serverId = localStorage.getItem('fichab_serverid');
      
      console.log('Auth data:', { ciSession, serverId });

      if (!ciSession) {
        console.warn('No ci_session found in localStorage');
        return;
      }

      const response = await fetch('/api/fichab/sujeto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut,
          ciSession,
          serverId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Result:', result);
        if (result.success && result.data) {
          form.setValue('nombreSujeto', result.data.nombreSujeto);
          // Note: Nacionalidad mapping is pending proper ID lookup
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching personal data:', error);
    }
  };

  const handleRunChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const isExtranjero = form.getValues('esExtranjero');
    
    console.log('handleRunChange:', { val, isExtranjero });

    if (!isExtranjero) {
      const formattedRun = formatRun(val);
      form.setValue('docId', formattedRun);
      const isValidRun = validateRun(formattedRun);
      
      console.log('Validation result:', { formattedRun, isValidRun });
      
      if (isValidRun) {
        console.log('Triggering fetchPersonalData...');
        await fetchPersonalData(formattedRun);
      }
    } else {
      form.setValue('docId', val);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <FormField
            control={form.control}
            name="esExtranjero"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      form.trigger('docId');
                      if (!checked) {
                        validateRun(form.getValues('docId'));
                      }
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Es extranjero
                  </FormLabel>
                </div>
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
                {error && !form.watch('esExtranjero') && (
                  <span className="text-sm text-destructive">{error}</span>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {fotoSujeto && (
            <div className="flex justify-center mb-4">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={fotoSujeto} alt="Foto Sujeto" className="h-32 w-32 object-cover rounded-md border" />
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={fetchFoto}
              disabled={loadingFoto || !form.getValues('docId')}
              className="gap-2"
            >
              {loadingFoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Cargar Foto FICHAB
            </Button>
          </div>

          <FormField
            control={form.control}
            name="nombreSujeto"
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
                    placeholder="Ingrese características físicas o distintiva separadas por coma"
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

      {isEditing && imputadoId && (
        <>
          <ImputadoPhotos imputadoId={imputadoId} />
          <Separator />
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Causas Asociadas</h3>
              <CausaImputadoContainer
                imputadoId={imputadoId}
                onSuccess={handleCausaSuccess}
                trigger={
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Asociar Causa
                  </Button>
                }
              />
            </div>
            <CausasGrid causas={causasAsociadas} imputadoId={imputadoId} />
          </div>

          <Separator />
        </>
      )}
    </div>
  );
};

export default ImputadoForm;