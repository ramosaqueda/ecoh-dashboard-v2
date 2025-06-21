'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CausaSelector from '@/components/select/CausaSelector';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";

interface Fiscal {
  id: number;
  nombre: string;
}

interface Tribunal {
  id: number;
  nombre: string;
}

interface UnidadPolicial {
  id: number;
  nombre: string;
}

interface Hallazgo {
  id: number;
  nombre: string;
}

const medidaIntrusivaSchema = z.object({
  causaId: z.string().min(1, "Debe seleccionar una causa"),
  fiscalSolicitante: z.string().min(1, "Debe seleccionar un fiscal"),
  fechaSolicitud: z.string().min(1, "Debe ingresar una fecha"),
  tribunal: z.string().min(1, "Debe seleccionar un tribunal"),
  nombreJuez: z.string().min(1, "Debe ingresar el nombre del juez"),
  unidadPolicial: z.string().min(1, "Debe seleccionar una unidad policial"),
  resolucion: z.enum(['aprueba_totalidad', 'aprueba_parcialmente', 'previo_resolver', 'rechaza'], {
    required_error: "Debe seleccionar una resolución"
  }),
  numDomiciliosSolicitud: z.string().optional(),
  numDomiciliosAprobados: z.string().optional(),
  numDetenidos: z.string().optional(),
  hallazgos: z.array(z.string()).optional(),
  observaciones: z.string().optional()
});

type MedidaIntrusivaFormValues = z.infer<typeof medidaIntrusivaSchema>;

interface FormMedIntrusivaProps {
  onSubmit: (data: MedidaIntrusivaFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<MedidaIntrusivaFormValues>;
}

export default function FormMedIntrusiva({ 
  onSubmit, 
  isSubmitting = false, 
  initialData 
}: FormMedIntrusivaProps) {
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);
  const [tribunales, setTribunales] = useState<Tribunal[]>([]);
  const [unidadesPoliciales, setUnidadesPoliciales] = useState<UnidadPolicial[]>([]);
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fiscalesResponse = await fetch('/api/fiscal');
        const fiscalesData = await fiscalesResponse.json();
        setFiscales(fiscalesData);

        const tribunalesResponse = await fetch('/api/tribunal');
        const tribunalesData = await tribunalesResponse.json();
        setTribunales(tribunalesData);

        const unidadesResponse = await fetch('/api/unidad-policial');
        const unidadesData = await unidadesResponse.json();
        setUnidadesPoliciales(unidadesData);

        const hallazgosResponse = await fetch('/api/mi-hallazgos');
        const hallazgosData = await hallazgosResponse.json();
        setHallazgos(hallazgosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const form = useForm<MedidaIntrusivaFormValues>({
    resolver: zodResolver(medidaIntrusivaSchema),
    defaultValues: {
      causaId: initialData?.causaId || '',
      fiscalSolicitante: initialData?.fiscalSolicitante || '',
      fechaSolicitud: initialData?.fechaSolicitud || '',
      tribunal: initialData?.tribunal || '',
      nombreJuez: initialData?.nombreJuez || '',
      unidadPolicial: initialData?.unidadPolicial || '',
      resolucion: initialData?.resolucion || undefined,
      numDomiciliosSolicitud: initialData?.numDomiciliosSolicitud || '',
      numDomiciliosAprobados: initialData?.numDomiciliosAprobados || '',
      numDetenidos: initialData?.numDetenidos || '',
      hallazgos: initialData?.hallazgos || [],
      observaciones: initialData?.observaciones || ''
    }
  });
  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="causaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC</FormLabel>
                  <FormControl>
                    <CausaSelector
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.causaId?.message}
                      isDisabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fiscalSolicitante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal solicitante</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un fiscal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fiscales.map((fiscal) => (
                        <SelectItem key={fiscal.id} value={fiscal.id.toString()}>
                          {fiscal.nombre}
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
              name="fechaSolicitud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha solicitud</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tribunal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tribunal</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tribunal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tribunales.map((tribunal) => (
                        <SelectItem key={tribunal.id} value={tribunal.id.toString()}>
                          {tribunal.nombre}
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
              name="nombreJuez"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Juez</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidadPolicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad Policial</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una unidad policial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unidadesPoliciales.map((unidad) => (
                        <SelectItem key={unidad.id} value={unidad.id.toString()}>
                          {unidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="resolucion"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Resolución del tribunal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isSubmitting}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="aprueba_totalidad" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Aprueba totalidad
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="aprueba_parcialmente" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Aprueba parcialmente
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="previo_resolver" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Previo a resolver
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="rechaza" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Rechaza
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hallazgos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hallazgos</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {hallazgos.map((hallazgo) => (
                        <div key={hallazgo.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`hallazgo-${hallazgo.id}`}
                            className="h-4 w-4 rounded border-gray-300"
                            checked={field.value?.includes(hallazgo.id.toString())}
                            onChange={(e) => {
                              const current = field.value || [];
                              const newValue = e.target.checked
                                ? [...current, hallazgo.id.toString()]
                                : current.filter((val) => val !== hallazgo.id.toString());
                              field.onChange(newValue);
                            }}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`hallazgo-${hallazgo.id}`}
                            className="text-sm font-medium"
                          >
                            {hallazgo.nombre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Nueva fila para los campos numéricos */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="numDomiciliosSolicitud"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">N° domicilios en solicitud (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numDomiciliosAprobados"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">N° domicilios aprobados (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numDetenidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-600">Número detenidos (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}