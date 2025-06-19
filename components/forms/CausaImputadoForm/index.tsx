'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';

interface Causa {
  id: number;
  ruc: string;
  denominacionCausa: string;
}

interface Cautelar {
  id: number;
  nombre: string;
}

interface CausaImputadoFormProps {
  imputadoId: string;
  onSubmit: (data: CausaImputadoFormValues) => Promise<void>;
  isSubmitting: boolean;
  isEdit?: boolean;
  initialData?: any;
}

const CausaImputadoSchema = z
  .object({
    causaId: z.string().min(1, 'Debe seleccionar una causa'),
    esimputado: z.boolean().default(false),
    essujetoInteres: z.boolean().default(false),
    formalizado: z.boolean().default(false),
    fechaFormalizacion: z.date().nullable().optional(),
    cautelarId: z.string().optional().nullable(),
    plazo: z.number().nullable().default(0)
  })
  .refine((data) => data.esimputado || data.essujetoInteres, {
    message:
      'Debe seleccionar al menos una calidad (Imputado o Sujeto de Interés)',
    path: ['esimputado']
  });

export type CausaImputadoFormValues = z.infer<typeof CausaImputadoSchema>;

function CausaSelector({
  causas,
  isLoading,
  isEdit,
  field,
  form
}: {
  causas: Causa[];
  isLoading: boolean;
  isEdit: boolean;
  field: any;
  form: any;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCausas = useMemo(() => {
    if (!Array.isArray(causas)) return [];

    if (!searchQuery) return causas;

    const query = searchQuery.toLowerCase();
    return causas.filter(
      (causa) =>
        causa.ruc.toLowerCase().includes(query) ||
        causa.denominacionCausa.toLowerCase().includes(query)
    );
  }, [causas, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading || isEdit}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </span>
          ) : (
            <span>
              {field.value
                ? causas?.find((c) => c.id.toString() === field.value)?.ruc
                : 'Seleccione un RUC'}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
        <div className="flex flex-col">
          <div className="flex items-center border-b p-2">
            <Input
              placeholder="Buscar por RUC o denominación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus:ring-0"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCausas.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No se encontraron resultados
              </div>
            ) : (
              filteredCausas.map((causa) => (
                <div
                  key={causa.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-2 p-2 hover:bg-muted',
                    field.value === causa.id.toString() && 'bg-muted'
                  )}
                  onClick={() => {
                    form.setValue('causaId', causa.id.toString(), {
                      shouldValidate: true
                    });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      field.value === causa.id.toString()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{causa.ruc}</span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {causa.denominacionCausa}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function CausaImputadoForm({
  imputadoId,
  onSubmit,
  isSubmitting,
  isEdit = false,
  initialData
}: CausaImputadoFormProps) {
  const [causas, setCausas] = useState<Causa[]>([]);
  const [cautelares, setCautelares] = useState<Cautelar[]>([]);
  const [isLoadingCausas, setIsLoadingCausas] = useState(true);
  const [isLoadingCautelares, setIsLoadingCautelares] = useState(true);

  const form = useForm<CausaImputadoFormValues>({
    resolver: zodResolver(CausaImputadoSchema),
    defaultValues: {
      causaId: initialData ? initialData.causaId.toString() : '',
      esimputado: initialData?.esimputado || false,
      essujetoInteres: initialData?.essujetoInteres || false,
      formalizado: initialData?.formalizado || false,
      fechaFormalizacion: initialData?.fechaFormalizacion
        ? new Date(initialData.fechaFormalizacion)
        : null,
      cautelarId: initialData?.cautelarId
        ? initialData.cautelarId.toString()
        : undefined,
      plazo: initialData?.plazo || 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCausas(true);
      setIsLoadingCautelares(true);
      try {
        const [causasResponse, cautelaresResponse] = await Promise.all([
          fetch('/api/causas'),
          fetch('/api/cautelar')
        ]);

        if (!causasResponse.ok || !cautelaresResponse.ok) {
          throw new Error('Error al cargar los datos');
        }

        const causasData = await causasResponse.json();
        const cautelaresData = await cautelaresResponse.json();

        setCausas(Array.isArray(causasData) ? causasData : []);
        setCautelares(Array.isArray(cautelaresData) ? cautelaresData : []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los datos');
        setCausas([]);
        setCautelares([]);
      } finally {
        setIsLoadingCausas(false);
        setIsLoadingCautelares(false);
      }
    };

    fetchData();
  }, []);

  const watchFormalizado = form.watch('formalizado');
  const watchEsImputado = form.watch('esimputado');

  const handleSubmit = async (data: CausaImputadoFormValues) => {
    const formattedData = {
      ...data,
      fechaFormalizacion: data.fechaFormalizacion
        ? new Date(data.fechaFormalizacion) // ✅ Mantener como Date, no como string
        : null
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Información de la Causa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="causaId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>RUC</FormLabel>
                  <CausaSelector
                    causas={causas}
                    isLoading={isLoadingCausas}
                    isEdit={isEdit}
                    field={field}
                    form={form}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="esimputado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Es Imputado</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="essujetoInteres"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Es Sujeto de Interés
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {watchEsImputado && (
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="formalizado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Formalizado</FormLabel>
                    </FormItem>
                  )}
                />

                {watchFormalizado && (
                  <>
                    <FormField
                      control={form.control}
                      name="fechaFormalizacion"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Formalización</FormLabel>
                          <FormControl>
                            <ReactDatePicker
                              selected={field.value}
                             
                              onChange={(date: Date | null) => field.onChange(date)}

                              dateFormat="dd/MM/yyyy"
                              locale={es}
                              placeholderText="Seleccione una fecha"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              maxDate={new Date()}
                              minDate={new Date('1900-01-01')}
                              isClearable
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              customInput={
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cautelarId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medida Cautelar</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                          
                            value={field.value || undefined}
                            disabled={isLoadingCautelares}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione una medida cautelar">
                                  {field.value
                                    ? cautelares.find(
                                        (c) => c.id.toString() === field.value
                                      )?.nombre
                                    : 'Seleccione una medida cautelar'}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cautelares.map((cautelar) => (
                                <SelectItem
                                  key={cautelar.id}
                                  value={cautelar.id.toString()}
                                >
                                  {cautelar.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plazo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plazo (días)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Ingrese el plazo en días
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !form.watch('causaId')}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : isEdit ? (
              'Actualizar'
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
