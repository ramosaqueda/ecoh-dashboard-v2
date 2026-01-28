import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

import FormField from './FormField';
import SwitchField from './SwitchField';
import AnalistaSelect from '@/components/select/AnalistaSelect';
import AtvtSelect from '@/components/select/AtvtSelect';
import AbogadoSelect from '@/components/select/AbogadoSelect';
import DelitoSelect from '@/components/select/DelitoSelect';
import TribunalSelect from '@/components/select/TribunalSelect';
import FiscalSelect from '@/components/select/FiscalSelect';
import FocoSelect from '@/components/select/FocoSelect';
import OrigenCausaSelector from '@/components/select/OrigenCausaSelector';
import EstadoCausaSelector from '@/components/select/EstadoCausaSelector';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { causaSchema } from '@/schemas/causaSchema';
import type { CausaFormData } from '@/types/causa';
import CrimenOrgParamsSelect from "@/components/select/CrimenOrgParamsSelect"

// ✅ Función helper para conversión segura de string a number
const parseSelectValue = (value: string): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// ✅ Función helper para convertir valores a string para los selectores
const formatSelectValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === 0) {
    return '';
  }
  return value.toString();
};

interface CausaFormProps {
  initialValues?: Partial<CausaFormData> & { causaId?: string | number };
  onSubmit: (data: CausaFormData) => Promise<void>;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const CausaForm: React.FC<CausaFormProps> = ({
  initialValues = {},
  onSubmit,
  isSubmitting,
  isEditing
}) => {
  const form = useForm<CausaFormData>({
    resolver: zodResolver(causaSchema),
    defaultValues: {
      // Valores por defecto para campos booleanos
      constituyeSs: false,
      homicidioConsumado: false,
      esCrimenOrganizado: false,
      causasCrimenOrg: [],
      // Nuevos campos para origen y estado
      origenCausaId: undefined,
      estadoCausaId: undefined,
      // Sobrescribir con los valores iniciales si existen
      ...initialValues
    }
  });

  const handleSubmit = async (data: CausaFormData) => {
    console.log('🔍 Formulario antes de enviar:', data);
    console.log('🔍 origenCausaId:', data.origenCausaId);
    console.log('🔍 estadoCausaId:', data.estadoCausaId);
    console.log('🔍 esCrimenOrganizado:', data.esCrimenOrganizado, 'Tipo:', typeof data.esCrimenOrganizado);
    console.log('🔍 causasCrimenOrg específico:', data.causasCrimenOrg);
  
    // Asegurar que causasCrimenOrg sea un array de números
    if (!data.causasCrimenOrg || !Array.isArray(data.causasCrimenOrg)) {
      data.causasCrimenOrg = [];
    } else {
      // Asegurar que todos los elementos son números
      data.causasCrimenOrg = (data.causasCrimenOrg as unknown[]).map(id => {
        if (typeof id === 'string') {
          const parsed = parseInt(id, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof id === 'number') {
          return id;
        }
        return 0; // valor por defecto para tipos no esperados
      });
    }
    
    console.log('🔍 causasCrimenOrg después de procesamiento:', data.causasCrimenOrg);
  
    try {
      await onSubmit(data);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  React.useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {


      const formattedValues = {
        ...initialValues,
        // ✅ Convertir IDs a números para el formulario
        abogado: initialValues.abogado ? parseSelectValue(initialValues.abogado.toString()) : undefined,
        analista: initialValues.analista ? parseSelectValue(initialValues.analista.toString()) : undefined,
        atvt: initialValues.atvt ? parseSelectValue(initialValues.atvt.toString()) : undefined,
        fiscalACargo: initialValues.fiscalACargo ? parseSelectValue(initialValues.fiscalACargo.toString()) : undefined,
        tribunal: initialValues.tribunal ? parseSelectValue(initialValues.tribunal.toString()) : undefined,
        delito: initialValues.delito ? parseSelectValue(initialValues.delito.toString()) : undefined,
        foco: initialValues.foco ? parseSelectValue(initialValues.foco.toString()) : undefined,
        // ✅ Nuevos campos - conversión segura
        origenCausaId: initialValues.origenCausaId ? parseSelectValue(initialValues.origenCausaId.toString()) : undefined,
        estadoCausaId: initialValues.estadoCausaId ? parseSelectValue(initialValues.estadoCausaId.toString()) : undefined,
        esCrimenOrganizado: initialValues.esCrimenOrganizado,
        // Asegurarse de que las fechas estén en el formato correcto
        fechaHoraTomaConocimiento: initialValues.fechaHoraTomaConocimiento
          ? new Date(initialValues.fechaHoraTomaConocimiento)
            .toISOString()
            .slice(0, 16)
          : '',
        fechaDelHecho: initialValues.fechaDelHecho
          ? new Date(initialValues.fechaDelHecho).toISOString().slice(0, 10)
          : '',
        fechaIta: initialValues.fechaIta
          ? new Date(initialValues.fechaIta).toISOString().slice(0, 10)
          : '',
        fechaPpp: initialValues.fechaPpp
          ? new Date(initialValues.fechaPpp).toISOString().slice(0, 10)
          : ''
      };

      console.log('🔍 Valores formateados:', {
        origenCausaId: formattedValues.origenCausaId,
        estadoCausaId: formattedValues.estadoCausaId
      });

      // Actualizar todos los campos con los valores formateados
      Object.entries(formattedValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof CausaFormData, value);
        }
      });
    } else {
      console.log('No initialValues provided');
    }
  }, [initialValues, form]);

  // Detectar si el delito seleccionado es homicidio para mostrar campo condicional
  const selectedDelito = form.watch('delito');
  const isHomicidio = selectedDelito?.toString() === "1";
  const isFormDirty = Object.keys(form.formState.dirtyFields).length > 0;

  // ✅ Obtener valores actuales para los selectores con conversión segura
  const currentOrigenCausaId = form.watch('origenCausaId');
  const currentEstadoCausaId = form.watch('estadoCausaId');

  console.log('🔍 Valores actuales en formulario:', {
    origenCausaId: currentOrigenCausaId,
    estadoCausaId: currentEstadoCausaId
  });

  return (
    <Card className="mx-auto w-full max-w-[1200px]">
      <Separator className="mb-4" />
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Sección de Datos Principales */}
            <div className="space-y-4">
              <h3 className="font-medium">Datos Principales</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  form={form}
                  name="denominacionCausa"
                  label="Denominación Causa"
                  required
                >
                  <Input placeholder="Ingrese denominación" />
                </FormField>

                <FormField
                  form={form}
                  name="fechaHoraTomaConocimiento"
                  label="Fecha y Hora Toma Conocimiento"
                  required
                >
                  <Input type="datetime-local" />
                </FormField>

                <FormField
                  form={form}
                  name="fechaDelHecho"
                  label="Fecha del Hecho"
                  required
                >
                  <Input type="date" />
                </FormField>
              </div>
            </div>

            {/* Sección de Origen y Estado */}
            <div className="space-y-4">
              <h3 className="font-medium">Radicación y Estado de la Causa</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField form={form} name="origenCausaId" label="Radicación de la Causa">
                  <OrigenCausaSelector
                    value={formatSelectValue(currentOrigenCausaId)}
                    onChange={(value) => {
                      
                      form.setValue('origenCausaId', value ? parseSelectValue(value) : undefined, {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                    error={form.formState.errors.origenCausaId?.message}
                    includeEmpty={true}
                    emptyLabel="Sin radicación específica"
                  />
                </FormField>

                <FormField form={form} name="estadoCausaId" label="Estado de la Causa">
                  <EstadoCausaSelector
                    value={formatSelectValue(currentEstadoCausaId)}
                    onChange={(value) => {
                      
                      form.setValue('estadoCausaId', value ? parseSelectValue(value) : undefined, {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                    error={form.formState.errors.estadoCausaId?.message}
                    includeEmpty={true}
                    emptyLabel="Sin estado específico"
                  />
                </FormField>

                <div className="space-y-4">
                  <SwitchField
                    form={form}
                    name="constituyeSs"
                    label="Constituye SS"
                  />
                  {isHomicidio && (
                    <SwitchField form={form} name="homicidioConsumado" label="Homicidio Consumado" />
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Identificación */}
            <div className="space-y-4">
              <h3 className="font-medium">Identificación</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField form={form} name="ruc" label="RUC">
                  <Input placeholder="Ingrese RUC" />
                </FormField>

                <FormField form={form} name="foliobw" label="Folio BW">
                  <Input placeholder="Ingrese folio" />
                </FormField>

                <FormField form={form} name="rit" label="RIT">
                  <Input placeholder="Ingrese RIT" />
                </FormField>
              </div>
            </div>

            {/* Sección de Clasificación */}
            <div className="space-y-4">
              <h3 className="font-medium">Clasificación</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField form={form} name="delito" label="Delito" required>
                  <DelitoSelect
                    value={formatSelectValue(form.watch('delito'))}
                    onValueChange={(value) =>
                      form.setValue('delito', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                    error={form.formState.errors.delito?.message}
                  />
                </FormField>

                <FormField form={form} name="foco" label="Foco">
                  <FocoSelect
                    value={formatSelectValue(form.watch('foco'))}
                    onValueChange={(value) =>
                      form.setValue('foco', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField
                  form={form}
                  name="coordenadasSs"
                  label="Coordenadas SS"
                >
                  <Input placeholder="Ingrese coordenadas" />
                </FormField>
              </div>
            </div>

            {/* Sección de Responsables */}
            <div className="space-y-4">
              <h3 className="font-medium">Responsables</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  form={form}
                  name="fiscalACargo"
                  label="Fiscal a Cargo"
                >
                  <FiscalSelect
                    value={formatSelectValue(form.watch('fiscalACargo'))}
                    onValueChange={(value) =>
                      form.setValue('fiscalACargo', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="abogado" label="Abogado">
                  <AbogadoSelect
                    value={formatSelectValue(form.watch('abogado'))}
                    onValueChange={(value) =>
                      form.setValue('abogado', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="analista" label="Analista">
                  <AnalistaSelect
                    value={formatSelectValue(form.watch('analista'))}
                    onValueChange={(value) =>
                      form.setValue('analista', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="atvt" label="Atvt">
                  <AtvtSelect
                    value={formatSelectValue(form.watch('atvt'))}
                    onValueChange={(value) => {
                 
                      form.setValue('atvt', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  />
                </FormField>

                <FormField form={form} name="tribunal" label="Tribunal">
                  <TribunalSelect
                    value={formatSelectValue(form.watch('tribunal'))}
                    onValueChange={(value) =>
                      form.setValue('tribunal', parseSelectValue(value), {
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                    error={form.formState.errors.tribunal?.message}
                  />
                </FormField>
              </div>
            </div>

            {/* Sección de Fechas Adicionales */}
            <div className="space-y-4">
              <h3 className="font-medium">Fechas y Números de Registro</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField form={form} name="fechaIta" label="Fecha ITA">
                  <Input type="date" />
                </FormField>

                <FormField form={form} name="numeroIta" label="N° ITA">
                  <Input placeholder="Ingrese N° ITA" />
                </FormField>
              </div>
            </div>

            {/* Sección de Parámetros de Crimen Organizado */}
            <div className="space-y-4">
              <h3 className="font-medium">Parámetros Crimen Organizado</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  form={form}
                  name="causasCrimenOrg"
                  label="Parámetros de Crimen Organizado"
                >
                  <CrimenOrgParamsSelect causaId={initialValues.causaId} />
                </FormField>
                <SwitchField
                  form={form}
                  name="esCrimenOrganizado"
                  label="Es Crimen Organizado"
                />
              </div>
            </div>

            {/* Sección de Observaciones */}
            <div className="space-y-4">
              <h3 className="font-medium">Observaciones</h3>

              <FormField form={form} name="observacion" label="Observación">
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Ingrese observaciones adicionales..."
                />
              </FormField>
            </div>

            <Separator />

            {/* Botones de Acción */}
            <div className="sticky bottom-0 flex justify-end space-x-4 bg-white py-4">
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting || !isFormDirty}
                >
                  Limpiar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || (!isFormDirty && !isEditing)}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </span>
                ) : isEditing ? (
                  'Actualizar Causa'
                ) : (
                  'Guardar Causa'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CausaForm;