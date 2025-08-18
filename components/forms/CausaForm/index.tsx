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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from "@/components/ui/label";
import { TriangleAlert } from 'lucide-react';

import FormField from './FormField';
import SwitchField from './SwitchField';
import AnalistaSelect from '@/components/select/AnalistaSelect';
import AtvtSelect from '@/components/select/AtvtSelect';
import AbogadoSelect from '@/components/select/AbogadoSelect';
import DelitoSelect from '@/components/select/DelitoSelect';
import TribunalSelect from '@/components/select/TribunalSelect';
import FiscalSelect from '@/components/select/FiscalSelect';
import FocoSelect from '@/components/select/FocoSelect';
import OrigenCausaSelector from '@/components/select/OrigenCausaSelector'; // Nuevo selector


import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import { causaSchema, type CausaFormData } from '@/schemas/causaSchema';
//import DatosRelato from '@/components/relato-hecho/datos-relato';
import CrimenOrgParamsSelect from "@/components/select/CrimenOrgParamsSelect"

// ✅ Función helper para conversión segura de string a number
const parseSelectValue = (value: string): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
};

interface CausaFormProps {
  initialValues?: Partial<CausaFormData> & { causaId?: string | number }; // ✅ Extender el tipo
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
      causaEcoh: false,
      causaSacfi: false, // ✅ Nuevo campo agregado
      causaLegada: false,
      constituyeSs: false,
      homicidioConsumado: false,
      causasCrimenOrg: [],
      // Sobrescribir con los valores iniciales si existen
      ...initialValues
    }
  });

  // ✅ Lógica mejorada para manejar la compatibilidad entre nuevo selector y switches antiguos
  const origenCausaIdValue = form.watch('origenCausaId');
  const causaEcohValue = form.watch('causaEcoh');
  const causaSacfiValue = form.watch('causaSacfi');
  const causaLegadaValue = form.watch('causaLegada');

  // ✅ Efecto para sincronizar selector nuevo con switches antiguos
  React.useEffect(() => {
    // Si no hay origen seleccionado, usar lógica antigua de switches mutuamente excluyentes
    if (!origenCausaIdValue) {
      if (causaEcohValue === true && causaSacfiValue === true) {
        form.setValue('causaSacfi', false, { shouldDirty: true });
      }
      if (causaSacfiValue === true && causaEcohValue === true) {
        form.setValue('causaEcoh', false, { shouldDirty: true });
      }
    }
  }, [causaEcohValue, causaSacfiValue, origenCausaIdValue, form]);

  const handleSubmit = async (data: CausaFormData) => {
    console.log('📋 Formulario antes de enviar:', data);
    console.log('🎯 origenCausaId específico:', {
      valor: data.origenCausaId,
      tipo: typeof data.origenCausaId,
      esNull: data.origenCausaId === null,
      esUndefined: data.origenCausaId === undefined
    });
    console.log('causasCrimenOrg específico:', data.causasCrimenOrg);
  
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
    
    console.log('causasCrimenOrg después de procesamiento:', data.causasCrimenOrg);
  
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
      console.log('Initial values received:', initialValues);

      const formattedValues = {
        ...initialValues,
        // ✅ Manejar origenCausaId
        origenCausaId: initialValues.origenCausaId ? parseSelectValue(initialValues.origenCausaId.toString()) : undefined,
        // ✅ Convertir IDs a números para el formulario
        abogado: initialValues.abogado ? parseSelectValue(initialValues.abogado.toString()) : undefined,
        analista: initialValues.analista ? parseSelectValue(initialValues.analista.toString()) : undefined,
        atvt: initialValues.atvt ? parseSelectValue(initialValues.atvt.toString()) : undefined,
        fiscalACargo: initialValues.fiscalACargo ? parseSelectValue(initialValues.fiscalACargo.toString()) : undefined,
        tribunal: initialValues.tribunal ? parseSelectValue(initialValues.tribunal.toString()) : undefined,
        delito: initialValues.delito ? parseSelectValue(initialValues.delito.toString()) : undefined,
        foco: initialValues.foco ? parseSelectValue(initialValues.foco.toString()) : undefined,
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

  const selectedDelito = form.watch('delito');
  const isHomicidio = selectedDelito?.toString() === "1";
  const isFormDirty = Object.keys(form.formState.dirtyFields).length > 0;

  return (
    <Card className="mx-auto w-full max-w-[1200px]">
      <Separator className="mb-4" />
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Sección de Switches */}
            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              <h3 className="mb-4 font-medium">Configuración inicial</h3>
              
              {/* NUEVO: Selector de Origen de Causa */}
              <div className="mb-6">
                <FormField form={form} name="origenCausaId" label="Origen de Causa">
                  <OrigenCausaSelector
                    value={form.watch('origenCausaId')?.toString() || ''}
                    onChange={(value) => {
                      const numericValue = value ? parseInt(value) : undefined;
                      form.setValue('origenCausaId', numericValue, {
                        shouldValidate: true,
                        shouldDirty: true
                      });
                      
                      // LÓGICA DE COMPATIBILIDAD: Actualizar switches antiguos basados en la selección
                      if (numericValue) {
                        // Resetear todos los switches primero
                        form.setValue('causaEcoh', false);
                        form.setValue('causaSacfi', false);
                        form.setValue('causaLegada', false);
                        
                        // Activar el switch correspondiente basado en el ID
                        // Nota: Esta lógica se basa en los IDs de tu base de datos
                        // Asumiendo: 1=ECOH, 2=SACFI, 3=LEGADA (ajustar según tu BD)
                        if (numericValue === 1) {
                          form.setValue('causaEcoh', true);
                        } else if (numericValue === 2) {
                          form.setValue('causaSacfi', true);
                        } else if (numericValue === 3) {
                          form.setValue('causaLegada', true);
                        }
                      }
                    }}
                    error={form.formState.errors.origenCausaId?.message}
                    includeEmpty
                    emptyLabel="Sin origen específico"
                  />
                </FormField>
              </div>
              
              {/* DEPRECATED: Switches antiguos - mantener para compatibilidad */}
              <div className="rounded border border-orange-200 bg-orange-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm text-orange-700">
                  <TriangleAlert className="h-4 w-4" />
                  <span className="font-medium">Método anterior (deprecated)</span>
                </div>
                <p className="mb-3 text-xs text-orange-600">
                  Estos switches serán removidos en futuras versiones. Use "Origen de Causa" arriba.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SwitchField 
                    form={form} 
                    name="causaEcoh" 
                    label="Causa ECOH" 
                    disabled={!!form.watch('origenCausaId')} // Deshabilitar si se usa el nuevo selector
                  />
                  <SwitchField 
                    form={form} 
                    name="causaSacfi" 
                    label="Causa SACFI" 
                    disabled={!!form.watch('origenCausaId')}
                  />
                  <SwitchField
                    form={form}
                    name="causaLegada"
                    label="Causa Legada"
                    disabled={!!form.watch('origenCausaId')}
                  />
                </div>
              </div>
              
              {/* Otros switches */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    value={form.watch('delito')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('delito', parseSelectValue(value), { // ✅ Convertir a number
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                    error={form.formState.errors.delito?.message}
                  />
                </FormField>

                <FormField form={form} name="foco" label="Foco">
                  <FocoSelect
                    value={form.watch('foco')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('foco', parseSelectValue(value), { // ✅ Convertir a number
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
                    value={form.watch('fiscalACargo')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('fiscalACargo', parseSelectValue(value), { // ✅ Convertir a number
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="abogado" label="Abogado">
                  <AbogadoSelect
                    value={form.watch('abogado')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('abogado', parseSelectValue(value), { // ✅ Convertir a number
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="analista" label="Analista">
                  <AnalistaSelect
                    value={form.watch('analista')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('analista', parseSelectValue(value), { // ✅ Convertir a number
                        shouldValidate: true,
                        shouldDirty: true
                      })
                    }
                  />
                </FormField>

                <FormField form={form} name="atvt" label="Atvt">
                  <AtvtSelect
                    value={form.watch('atvt')?.toString() || ''}
                    onValueChange={(value) => {
                      console.log('ATVT seleccionado:', value);
                      form.setValue('atvt', parseSelectValue(value), { // ✅ Convertir a number
                        shouldValidate: true,
                        shouldDirty: true
                      });
                    }}
                  />
                </FormField>

                <FormField form={form} name="tribunal" label="Tribunal">
                  <TribunalSelect
                    value={form.watch('tribunal')?.toString() || ''}
                    onValueChange={(value) =>
                      form.setValue('tribunal', parseSelectValue(value), { // ✅ Convertir a number
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FormField form={form} name="fechaIta" label="Fecha ITA">
                  <Input type="date" />
                </FormField>

                <FormField form={form} name="numeroIta" label="N° ITA">
                  <Input placeholder="Ingrese N° ITA" />
                </FormField>

                <FormField form={form} name="fechaPpp" label="Fecha PPP">
                  <Input type="date" />
                </FormField>

                <FormField form={form} name="numeroPpp" label="N° PPP">
                  <Input placeholder="Ingrese N° PPP" />
                </FormField>
              </div>
            </div>

            {/* Sección de Parámetros de Crimen Organizado */}
            <div className="space-y-4">
              <h3 className="font-medium">Parámetros Crimen Organizado</h3>
              <FormField
                form={form}
                name="causasCrimenOrg"
                label="Parámetros de Crimen Organizado"
              >
                <CrimenOrgParamsSelect causaId={initialValues.causaId} />
              </FormField>
              <div className="items-top flex space-x-2">
                <RadioGroup
                  value={form.watch('esCrimenOrganizado') === true ? '0' : form.watch('esCrimenOrganizado') === false ? '1' : '2'}
                  onValueChange={(value) => {
                   
                    const booleanValue = value === '0' ? true : false;
                    form.setValue('esCrimenOrganizado', booleanValue, {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="esCO" />
                    <Label htmlFor="esCO">Es Crimen Organizado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="noCO" />
                    <Label htmlFor="noCO">No es Crimen Organizado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="desconoce" />
                    <Label htmlFor="desconoce">Se desconoce</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Sección de Observaciones */}
            <div className="space-y-4">
              <h3 className="font-medium">Observaciones</h3>
              
              {/* Campo Datos Relevantes con label personalizado */}
              

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