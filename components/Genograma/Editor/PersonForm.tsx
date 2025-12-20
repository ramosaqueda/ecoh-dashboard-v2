'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Persona, RolEspecial, RamaFamiliar } from '@/components/Genograma/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X } from 'lucide-react';

const personaSchema = z.object({
  id: z.string().min(1, { message: 'El ID es requerido' }),
  nombreCompleto: z.string().min(1, { message: 'El nombre completo es requerido' }),
  genero: z.enum(['masculino', 'femenino'], {
    required_error: 'El género es requerido',
  }),
  fechaNacimiento: z.string().optional(),
  esFallecido: z.boolean().optional(),
  fechaFallecimiento: z.string().optional(),
  rolEspecial: z.enum(['ninguno', 'victima', 'imputado']).default('ninguno'),
  ramaFamiliar: z.enum(['ninguna', 'principal', 'paterna', 'materna', 'politica', 'personalizada']).default('ninguna'),
  colorRama: z.string().optional(),
  nombreRama: z.string().optional(),
  fotoUrl: z.string().url({ message: "Debe ser una URL válida" }).optional().or(z.literal('')),
}).refine(data => {
  if (data.ramaFamiliar === 'personalizada') {
    return !!data.nombreRama && !!data.colorRama;
  }
  return true;
}, {
  message: "Para rama personalizada, debe indicar nombre y color",
  path: ["ramaFamiliar"],
});

type PersonaFormData = z.infer<typeof personaSchema>;

interface PersonFormProps {
  initialData?: Persona | null;
  onSubmit: (data: Persona) => void;
  onCancel: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      id: '',
      nombreCompleto: '',
      genero: 'masculino',
      fechaNacimiento: '',
      esFallecido: false,
      fechaFallecimiento: '',
      rolEspecial: 'ninguno',
      ramaFamiliar: 'ninguna',
      colorRama: '#ffffff',
      nombreRama: '',
      fotoUrl: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        nombreCompleto: initialData.nombreCompleto || `${initialData.nombre} ${initialData.apellido}`.trim(),
        fechaNacimiento: initialData.fechaNacimiento || '',
        fechaFallecimiento: initialData.fechaFallecimiento || '',
        colorRama: initialData.colorRama || '#ffffff',
        nombreRama: initialData.nombreRama || '',
        fotoUrl: initialData.fotoUrl || '',
      });
    } else {
        reset({
            id: '',
            nombreCompleto: '',
            genero: 'masculino',
            fechaNacimiento: '',
            esFallecido: false,
            fechaFallecimiento: '',
            rolEspecial: 'ninguno',
            ramaFamiliar: 'ninguna',
            colorRama: '#ffffff',
            nombreRama: '',
            fotoUrl: '',
          });
    }
  }, [initialData, reset]);

  const fetchPersonDetails = async (rut: string) => {
    if (!rut) return;
    try {
        // Try Imputado first
        let res = await fetch(`/api/imputado?docId=${rut}`);
        if (res.ok) {
            const data = await res.json();
            setValue('nombreCompleto', data.nombreSujeto || '', { shouldValidate: true });
            if (data.fotoPrincipal) {
                 setValue('fotoUrl', data.fotoPrincipal, { shouldValidate: true });
            }
            setValue('rolEspecial', 'imputado', { shouldValidate: true });
            // Could set gender if available or infer? Not usually available in simple response without parsing
            return;
        }

        // Try Victima
        res = await fetch(`/api/victima?docId=${rut}`);
        if (res.ok) {
            const data = await res.json();
            setValue('nombreCompleto', data.nombreVictima || '', { shouldValidate: true });
             setValue('rolEspecial', 'victima', { shouldValidate: true });
             // Victima might not have photo in DB model based on review (no fotoPrincipal in select)
            return;
        }
        
        // If not found, maybe toast?
        alert('No se encontraron datos en la base de datos para este RUT.');

    } catch (e) {
        console.error("Error fetching details", e);
    }
  };

  const onFormSubmit = (data: PersonaFormData) => {
    const personaData: Persona = {
      ...data,
      nombre: data.nombreCompleto.split(' ')[0] || '',
      segundoNombre: '',
      apellido: data.nombreCompleto.split(' ').slice(1).join(' ') || '',
      segundoApellido: '',
      fotoUrl: data.fotoUrl || undefined,
    };
    onSubmit(personaData);
  };

  const esFallecido = watch('esFallecido');
  const ramaFamiliar = watch('ramaFamiliar');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 p-4 border rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{initialData ? 'Editar Persona' : 'Nueva Persona'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id">ID</Label>
          <Input 
            id="id" 
            placeholder="P1" 
            {...register('id', {
                onBlur: (e) => {
                    const value = e.target.value;
                    if (value && !initialData) {
                        fetchPersonDetails(value);
                    }
                }
            })} 
            disabled={!!initialData} 
          />
          {errors.id && <span className="text-sm text-red-500">{errors.id.message}</span>}
        </div>

        <div>
          <Label htmlFor="genero">Género</Label>
          <Select 
            value={watch('genero')} 
            onValueChange={(val) => setValue('genero', val as any, { shouldValidate: true })}
          >
            <SelectTrigger><SelectValue placeholder="Género" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
            </SelectContent>
          </Select>
          {errors.genero && <span className="text-sm text-red-500">{errors.genero.message}</span>}
        </div>
      </div>

      <div>
        <Label htmlFor="nombreCompleto">Nombre Completo</Label>
        <Input id="nombreCompleto" placeholder="Nombre completo" {...register('nombreCompleto')} />
        {errors.nombreCompleto && <span className="text-sm text-red-500">{errors.nombreCompleto.message}</span>}
      </div>

      <div>
        <Label htmlFor="fotoUrl">Foto URL (Opcional)</Label>
        <Input id="fotoUrl" placeholder="https://..." {...register('fotoUrl')} />
        {errors.fotoUrl && <span className="text-sm text-red-500">{errors.fotoUrl.message}</span>}
      </div>

    <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => fetchPersonDetails(watch('id'))} disabled={!watch('id')}>
            Buscar Datos (RUT)
        </Button>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
            <Label htmlFor="fechaNacimiento">Fecha Nacimiento</Label>
            <Input id="fechaNacimiento" type="date" {...register('fechaNacimiento')} />
         </div>
         <div className="flex items-center space-x-2 pt-6">
            <Checkbox 
                id="esFallecido" 
                checked={watch('esFallecido')} 
                onCheckedChange={(c) => setValue('esFallecido', c === true)} 
            />
            <Label htmlFor="esFallecido">Fallecido</Label>
         </div>
      </div>

      {esFallecido && (
          <div>
            <Label htmlFor="fechaFallecimiento">Fecha Fallecimiento</Label>
            <Input id="fechaFallecimiento" type="date" {...register('fechaFallecimiento')} />
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="rolEspecial">Rol Especial</Label>
            <Select 
                value={watch('rolEspecial')} 
                onValueChange={(val) => setValue('rolEspecial', val as any)}
            >
                <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ninguno">Ninguno</SelectItem>
                    <SelectItem value="victima">Víctima</SelectItem>
                    <SelectItem value="imputado">Imputado</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="ramaFamiliar">Rama Familiar</Label>
            <Select 
                value={watch('ramaFamiliar')} 
                onValueChange={(val) => setValue('ramaFamiliar', val as any)}
            >
                <SelectTrigger><SelectValue placeholder="Rama" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ninguna">Ninguna</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="paterna">Paterna</SelectItem>
                    <SelectItem value="materna">Materna</SelectItem>
                    <SelectItem value="politica">Política</SelectItem>
                    <SelectItem value="personalizada">Personalizada</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {ramaFamiliar === 'personalizada' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="nombreRama">Nombre Rama</Label>
                <Input id="nombreRama" {...register('nombreRama')} />
            </div>
            <div>
                <Label htmlFor="colorRama">Color Rama</Label>
                <Input id="colorRama" type="color" {...register('colorRama')} />
            </div>
        </div>
      )}

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
