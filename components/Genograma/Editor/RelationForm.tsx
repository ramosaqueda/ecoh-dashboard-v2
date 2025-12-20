'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Persona, Relacion, TipoRelacion } from '@/components/Genograma/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, X } from 'lucide-react';

const relacionSchema = z.object({
  idOrigen: z.string().min(1, { message: 'Origen requerido' }),
  idDestino: z.string().min(1, { message: 'Destino requerido' }),
  tipo: z.enum(['matrimonio', 'padres', 'hermanos', 'primos', 'divorcio', 'otro'], {
    required_error: 'Tipo requerido',
  }),
  descripcion: z.string().optional(),
}).refine(data => data.idOrigen !== data.idDestino, {
  message: "No puede ser la misma persona",
  path: ["idDestino"],
});

type RelacionFormData = z.infer<typeof relacionSchema>;

interface RelationFormProps {
  initialData?: Relacion | null;
  personas: Persona[];
  onSubmit: (data: Relacion) => void;
  onCancel: () => void;
}

export const RelationForm: React.FC<RelationFormProps> = ({ initialData, personas, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RelacionFormData>({
    resolver: zodResolver(relacionSchema),
    defaultValues: {
      idOrigen: '',
      idDestino: '',
      tipo: 'matrimonio',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
        reset({
            idOrigen: '',
            idDestino: '',
            tipo: 'matrimonio',
            descripcion: '',
        });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: RelacionFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 p-4 border rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{initialData ? 'Editar Relación' : 'Nueva Relación'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="idOrigen">Persona Origen</Label>
          <Select 
            value={watch('idOrigen')} 
            onValueChange={(val) => setValue('idOrigen', val, { shouldValidate: true })}
            disabled={!!initialData} // Usually difficult to change IDs once set, simplify by disabling or allow re-creation
          >
            <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
            <SelectContent>
                {personas.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombreCompleto} ({p.id})</SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.idOrigen && <span className="text-sm text-red-500">{errors.idOrigen.message}</span>}
        </div>

        <div>
           <Label htmlFor="idDestino">Persona Destino</Label>
           <Select 
            value={watch('idDestino')} 
            onValueChange={(val) => setValue('idDestino', val, { shouldValidate: true })}
            disabled={!!initialData}
          >
            <SelectTrigger><SelectValue placeholder="Destino" /></SelectTrigger>
            <SelectContent>
                {personas.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombreCompleto} ({p.id})</SelectItem>
                ))}
            </SelectContent>
          </Select>
           {errors.idDestino && <span className="text-sm text-red-500">{errors.idDestino.message}</span>}
        </div>
      </div>

      <div>
        <Label htmlFor="tipo">Tipo Relación</Label>
        <Select 
            value={watch('tipo')}
            onValueChange={(val) => setValue('tipo', val as any)}
        >
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="matrimonio">Matrimonio</SelectItem>
                <SelectItem value="padres">Padres/Hijos</SelectItem>
                <SelectItem value="hermanos">Hermanos</SelectItem>
                <SelectItem value="primos">Primos</SelectItem>
                <SelectItem value="divorcio">Divorcio</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción (Notas)</Label>
        <Input id="descripcion" {...register('descripcion')} placeholder="Notas adicionales..." />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting} className="flex gap-2">
            <Save className="h-4 w-4" />
            {initialData ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
};
