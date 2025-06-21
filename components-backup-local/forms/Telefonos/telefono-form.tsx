'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Interfaces de tipos
interface Proveedor {
  id: number;
  nombre: string;
}

interface Ubicacion {
  id: number;
  nombre: string;
}

interface TelefonoData {
  numeroTelefonico?: string | number;
  idProveedorServicio?: number;
  id_ubicacion?: number;
  imei?: string;
  abonado?: string;
  solicitaTrafico?: boolean | null;
  solicitaImei?: boolean | null;
  extraccionForense?: boolean | null;
  enviar_custodia?: boolean | null;
  observacion?: string;
}

type FormValues = z.infer<typeof formSchema>;

interface TelefonoFormProps {
  initialData?: TelefonoData;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

const formSchema = z.object({
  numeroTelefonico: z.string()
    .min(9, 'El número debe tener al menos 9 dígitos')
    .max(12, 'El número no debe exceder 12 dígitos')
    .regex(/^\+?[0-9]+$/, 'El número solo puede contener dígitos y opcionalmente el símbolo +'),
  idProveedorServicio: z.string().min(1, 'Seleccione un proveedor'),
  id_ubicacion: z.string().min(1, 'Seleccione una ubicación'),
  imei: z.string().min(1, 'IMEI es requerido'),
  abonado: z.string().min(1, 'Abonado es requerido'),
  solicitaTrafico: z.boolean().nullable(),
  solicitaImei: z.boolean().nullable(),
  extraccionForense: z.boolean().nullable(),
  enviar_custodia: z.boolean().nullable(),
  observacion: z.string().optional()
});

export function TelefonoForm({
  initialData,
  onSubmit,
  onCancel
}: TelefonoFormProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preparación de valores iniciales
  const initialValues: FormValues = {
    numeroTelefonico: initialData?.numeroTelefonico 
      ? initialData.numeroTelefonico.toString() 
      : '',
    idProveedorServicio: initialData?.idProveedorServicio 
      ? initialData.idProveedorServicio.toString()
      : '',
    id_ubicacion: initialData?.id_ubicacion
      ? initialData.id_ubicacion.toString()
      : '',
    solicitaTrafico: initialData?.solicitaTrafico ?? null,
    solicitaImei: initialData?.solicitaImei ?? null,
    extraccionForense: initialData?.extraccionForense ?? null,
    enviar_custodia: initialData?.enviar_custodia ?? null,
    imei: initialData?.imei || '',
    abonado: initialData?.abonado || '',
    observacion: initialData?.observacion || ''
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const [proveedoresResponse, ubicacionesResponse] = await Promise.all([
          fetch('/api/proveedores'),
          fetch('/api/ubicaciones-telefono')
        ]);

        if (!proveedoresResponse.ok) throw new Error('Error al cargar proveedores');
        if (!ubicacionesResponse.ok) throw new Error('Error al cargar ubicaciones');

        const proveedoresData: Proveedor[] = await proveedoresResponse.json();
        const ubicacionesData: Ubicacion[] = await ubicacionesResponse.json();

        setProveedores(proveedoresData);
        setUbicaciones(ubicacionesData);
      } catch (error) {
        toast.error('Error al cargar los datos');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      const formattedValues = {
        ...values,
        numeroTelefonico: values.numeroTelefonico.replace(/\D/g, '') // Elimina todo excepto dígitos
      };
      await onSubmit(formattedValues);
    } catch (error) {
      toast.error('Error al guardar el teléfono');
      console.error('Error:', error);
    }
  };

  // Función auxiliar para manejar los cambios en los checkboxes
  const handleCheckboxChange = (field: any, value: boolean): void => {
    field.onChange(value === field.value ? null : value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="numeroTelefonico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número Telefónico</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+56912345678"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\+?\d*$/.test(value)) {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="idProveedorServicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor de Servicio</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un proveedor">
                      {proveedores.find(p => p.id.toString() === field.value)?.nombre}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {proveedores.map((proveedor) => (
                    <SelectItem
                      key={proveedor.id}
                      value={proveedor.id.toString()}
                    >
                      {proveedor.nombre}
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
          name="imei"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IMEI</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ingrese el IMEI del dispositivo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="abonado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abonado</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ingrese el nombre del abonado"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="solicitaTrafico"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => handleCheckboxChange(field, checked as boolean)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Solicita Tráfico
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitaImei"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => handleCheckboxChange(field, checked as boolean)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Solicita IMEI
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraccionForense"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => handleCheckboxChange(field, checked as boolean)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Extracción Forense
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enviar_custodia"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => handleCheckboxChange(field, checked as boolean)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Enviar a custodia
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="id_ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación Física</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una ubicación">
                      {ubicaciones.find(u => u.id.toString() === field.value)?.nombre}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ubicaciones.map((ubicacion) => (
                    <SelectItem
                      key={ubicacion.id}
                      value={ubicacion.id.toString()}
                    >
                      {ubicacion.nombre}
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
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Ingrese cualquier observación adicional"
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
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
          >
            {initialData ? 'Actualizar' : 'Crear'} Teléfono
          </Button>
        </div>
      </form>
    </Form>
  );
}