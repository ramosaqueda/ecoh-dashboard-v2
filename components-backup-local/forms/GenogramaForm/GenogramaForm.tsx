'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Persona, Relacion, TipoRelacion, RolEspecial, RamaFamiliar } from '@/components/Genograma/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, UsersRound, Save } from 'lucide-react';

// Esquema de validación para el formulario de persona
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
}).refine(data => {
  if (data.ramaFamiliar === 'personalizada') {
    return !!data.nombreRama && !!data.colorRama;
  }
  return true;
}, {
  message: "Para rama personalizada, debe indicar nombre y color",
  path: ["ramaFamiliar"],
});

// Esquema de validación para el formulario de relación
const relacionSchema = z.object({
  idOrigen: z.string().min(1, { message: 'La persona de origen es requerida' }),
  idDestino: z.string().min(1, { message: 'La persona de destino es requerida' }),
  tipo: z.enum(['matrimonio', 'padres', 'hermanos', 'primos', 'divorcio', 'otro'], {
    required_error: 'El tipo de relación es requerido',
  }),
  descripcion: z.string().optional(),
}).refine(data => data.idOrigen !== data.idDestino, {
  message: "No puede crear una relación con la misma persona",
  path: ["idDestino"],
});

interface GenogramaFormProps {
  onAddPersona: (persona: Persona) => void;
  onAddRelacion: (relacion: Relacion) => void;
  onSaveGenograma: () => void;
  isSaving?: boolean;
  personas: Persona[];
  rucCausa?: string;
  onChangeRuc: (ruc: string) => void;
}

export const GenogramaForm: React.FC<GenogramaFormProps> = ({
  onAddPersona,
  onAddRelacion,
  onSaveGenograma,
  isSaving = false,
  personas,
  rucCausa = '',
  onChangeRuc,
}) => {
  const [activeTab, setActiveTab] = useState<string>('persona');

  // Formulario para personas
  const {
    register: registerPersona,
    handleSubmit: handleSubmitPersona,
    reset: resetPersona,
    watch: watchPersona,
    setValue: setValuePersona,
    formState: { errors: errorsPersona, isSubmitting: isSubmittingPersona },
  } = useForm<z.infer<typeof personaSchema>>({
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
    },
  });

  // Formulario para relaciones
  const {
    register: registerRelacion,
    handleSubmit: handleSubmitRelacion,
    reset: resetRelacion,
    watch: watchRelacion,
    setValue: setValueRelacion,
    formState: { errors: errorsRelacion, isSubmitting: isSubmittingRelacion },
  } = useForm<z.infer<typeof relacionSchema>>({
    resolver: zodResolver(relacionSchema),
    defaultValues: {
      idOrigen: '',
      idDestino: '',
      tipo: 'matrimonio',
      descripcion: '',
    },
  });

  const onSubmitPersona = (data: z.infer<typeof personaSchema>) => {
    // Convertimos los datos simplificados al formato que espera el componente
    const personaData: Persona = {
      ...data,
      nombre: data.nombreCompleto.split(' ')[0] || '',
      segundoNombre: '',
      apellido: data.nombreCompleto.split(' ').slice(1).join(' ') || '',
      segundoApellido: '',
    };

    onAddPersona(personaData);
    resetPersona();
  };

  const onSubmitRelacion = (data: z.infer<typeof relacionSchema>) => {
    onAddRelacion(data);
    resetRelacion();
  };

  // Observar estados importantes
  const esFallecido = watchPersona('esFallecido');
  const ramaFamiliar = watchPersona('ramaFamiliar');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Datos del Genograma</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="rucCausa" className="whitespace-nowrap">RUC Causa:</Label>
            <Input
              id="rucCausa"
              value={rucCausa}
              onChange={(e) => onChangeRuc(e.target.value)}
              placeholder="Ingrese RUC"
              className="w-48"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={onSaveGenograma}
            disabled={isSaving || personas.length === 0 || !rucCausa}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="persona" className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Persona
            </TabsTrigger>
            <TabsTrigger value="relacion" className="flex items-center">
              <UsersRound className="mr-2 h-4 w-4" />
              Agregar Relación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="persona">
            <form onSubmit={handleSubmitPersona(onSubmitPersona)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id">ID</Label>
                  <Input
                    id="id"
                    placeholder="P1"
                    {...registerPersona('id')}
                  />
                  {errorsPersona.id && (
                    <span className="text-sm text-red-500">{errorsPersona.id.message}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="genero">Género</Label>
                  <Select 
                    defaultValue="masculino"
                    value={watchPersona('genero')}
                    onValueChange={(value) => {
                      setValuePersona('genero', value as 'masculino' | 'femenino', { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione el género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                  {errorsPersona.genero && (
                    <span className="text-sm text-red-500">{errorsPersona.genero.message}</span>
                  )}
                </div>
              </div>

              {/* Campo simplificado para nombre completo */}
              <div>
                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                <Input
                  id="nombreCompleto"
                  placeholder="Juan Pérez Gómez"
                  {...registerPersona('nombreCompleto')}
                />
                {errorsPersona.nombreCompleto && (
                  <span className="text-sm text-red-500">{errorsPersona.nombreCompleto.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...registerPersona('fechaNacimiento')}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="esFallecido"
                    checked={watchPersona('esFallecido')}
                    onCheckedChange={(checked) => 
                      setValuePersona('esFallecido', checked === true, { shouldValidate: true })
                    }
                  />
                  <Label htmlFor="esFallecido">Persona Fallecida</Label>
                </div>
              </div>

              {esFallecido && (
                <div>
                  <Label htmlFor="fechaFallecimiento">Fecha de Fallecimiento</Label>
                  <Input
                    id="fechaFallecimiento"
                    type="date"
                    {...registerPersona('fechaFallecimiento')}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rolEspecial">Rol Especial</Label>
                  <Select 
                    defaultValue="ninguno"
                    value={watchPersona('rolEspecial')}
                    onValueChange={(value) => {
                      setValuePersona('rolEspecial', value as RolEspecial, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione rol especial" />
                    </SelectTrigger>
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
                    defaultValue="ninguna"
                    value={watchPersona('ramaFamiliar')}
                    onValueChange={(value) => {
                      setValuePersona('ramaFamiliar', value as RamaFamiliar, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione rama familiar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Ninguna</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="paterna">Paterna</SelectItem>
                      <SelectItem value="materna">Materna</SelectItem>
                      <SelectItem value="politica">Política</SelectItem>
                      <SelectItem value="personalizada">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                  {errorsPersona.ramaFamiliar && (
                    <span className="text-sm text-red-500">{errorsPersona.ramaFamiliar.message}</span>
                  )}
                </div>
              </div>

              {ramaFamiliar === 'personalizada' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombreRama">Nombre de la Rama</Label>
                    <Input
                      id="nombreRama"
                      placeholder="Da Costa"
                      {...registerPersona('nombreRama')}
                    />
                    {errorsPersona.nombreRama && (
                      <span className="text-sm text-red-500">{errorsPersona.nombreRama.message}</span>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="colorRama">Color de la Rama</Label>
                    <Input
                      id="colorRama"
                      type="color"
                      {...registerPersona('colorRama')}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isSubmittingPersona} className="w-full">
                Agregar Persona
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="relacion">
            <form onSubmit={handleSubmitRelacion(onSubmitRelacion)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="idOrigen">Persona Origen</Label>
                  <Select 
                    defaultValue=""
                    value={watchRelacion('idOrigen') || ''}
                    onValueChange={(value) => {
                      setValueRelacion('idOrigen', value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione persona origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map(persona => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`} ({persona.id})
                          {persona.esFallecido ? ' †' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsRelacion.idOrigen && (
                    <span className="text-sm text-red-500">{errorsRelacion.idOrigen.message}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="idDestino">Persona Destino</Label>
                  <Select 
                    defaultValue=""
                    value={watchRelacion('idDestino') || ''}
                    onValueChange={(value) => {
                      setValueRelacion('idDestino', value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione persona destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map(persona => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`} ({persona.id})
                          {persona.esFallecido ? ' †' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsRelacion.idDestino && (
                    <span className="text-sm text-red-500">{errorsRelacion.idDestino.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Label htmlFor="tipo">Tipo de Relación</Label>
                <Select 
                  defaultValue="matrimonio"
                  value={watchRelacion('tipo')}
                  onValueChange={(value) => {
                    setValueRelacion('tipo', value as TipoRelacion, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione tipo de relación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matrimonio">Matrimonio</SelectItem>
                    <SelectItem value="padres">Padre/Madre - Hijo/a</SelectItem>
                    <SelectItem value="hermanos">Hermanos</SelectItem>
                    <SelectItem value="primos">Primos</SelectItem>
                    <SelectItem value="divorcio">Divorcio</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errorsRelacion.tipo && (
                  <span className="text-sm text-red-500">{errorsRelacion.tipo.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion">Etiqueta Personalizada (opcional)</Label>
                <Input
                  id="descripcion"
                  placeholder="Ej: Padrastro, Tutor legal, etc."
                  {...registerRelacion('descripcion')}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Esta etiqueta se mostrará en la línea de relación cuando el tipo sea &quot;otro&quot;
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmittingRelacion || personas.length < 2}
                className="w-full"
              >
                Agregar Relación
              </Button>
              
              {personas.length < 2 && (
                <p className="text-sm text-amber-600">
                  Debe agregar al menos dos personas para crear una relación.
                </p>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {personas.length} {personas.length === 1 ? 'persona' : 'personas'} en el genograma
          {rucCausa && <span className="ml-2">· RUC: {rucCausa}</span>}
        </div>
        <Button 
          variant="default" 
          onClick={onSaveGenograma}
          disabled={isSaving || personas.length === 0 || !rucCausa}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Genograma'}
        </Button>
      </CardFooter>
    </Card>
  );
};