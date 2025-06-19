import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, SquarePen } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Cautelar {
  id: number;
  nombre: string;
}

interface FormalizacionFormProps {
  causaId: string;
  imputadoId: string;
  onSuccess?: () => void;
}

const FormalizacionSchema = z.object({
  causaId: z.string(),
  imputadoId: z.string(),
  formalizado: z.boolean().default(false),
  fechaFormalizacion: z.date().nullable().optional(),
  cautelarId: z.string().nullable().optional(),
  plazo: z.number().nullable().default(0)
});

type FormalizacionFormValues = z.infer<typeof FormalizacionSchema>;

const ImputadoFormalizacionForm: React.FC<FormalizacionFormProps> = ({
  causaId,
  imputadoId,
  onSuccess
}) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [cautelares, setCautelares] = useState<Cautelar[]>([]);
  const [isLoadingCautelares, setIsLoadingCautelares] = useState(true);
  const [isLoadingCausaImputado, setIsLoadingCausaImputado] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plazo, setPlazo] = useState<number>(0);
  const { toast } = useToast();

  const form = useForm<FormalizacionFormValues>({
    resolver: zodResolver(FormalizacionSchema),
    defaultValues: {
      causaId: causaId,
      imputadoId: imputadoId,
      formalizado: false,
      fechaFormalizacion: null,
      cautelarId: null,
      plazo: 0
    }
  });

  const { setValue}= form;
  const watchFormalizado = form.watch("formalizado");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCautelares(true);
      setIsLoadingCausaImputado(true);
      
      try {

        const [cautelaresResponse, causaimputadoResponse] = await Promise.all([
          fetch('/api/cautelar'),
          fetch(`/api/causas-imputados?causaId=${causaId}`)
        ]);

        if (!cautelaresResponse.ok || !causaimputadoResponse.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const cautelaresData = await cautelaresResponse.json();
        const causasImputadoData = await causaimputadoResponse.json();
        
        // Encontrar la causa específica en el array de causas del imputado
        const causaImputadoData = causasImputadoData.find(
          (ci: any) => ci.causaId.toString() === causaId
        );

        setCautelares(cautelaresData);

        if (causaImputadoData) {
          console.log(causaImputadoData);
          form.reset({
            causaId: causaId,
            imputadoId: imputadoId,
            formalizado: causaImputadoData.formalizado || false,
            fechaFormalizacion: causaImputadoData.fechaFormalizacion ? new Date(causaImputadoData.fechaFormalizacion) : null,
            cautelarId: causaImputadoData.cautelarId?.toString() || null,
            plazo: causaImputadoData.plazo || 0
          });
          
        }
        
        
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error al cargar los datos'
        });
      } finally {
        setIsLoadingCautelares(false);
        setIsLoadingCausaImputado(false);
      }
    };

    if (isOpen) {
      fetchData();
    }

  }, [causaId, imputadoId, form, isOpen]);

  const handleFormalizadoChange = (checked: boolean) => {
    if (!checked) {
      form.setValue("fechaFormalizacion", null);
      form.setValue("plazo", 0);
    }
  };

  const handlePlazoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPlazo = Number(event.target.value);
    setValue('plazo', plazo + newPlazo);
  };

  const onSubmit = async (data: FormalizacionFormValues) => {

    try {
      setIsSubmitting(true);

      const formData = {
        causaId: causaId,
        formalizado: data.formalizado,
        fechaFormalizacion: data.formalizado ? data.fechaFormalizacion?.toISOString() : null,
        cautelarId: data.cautelarId ? Number(data.cautelarId) : null,
        plazo: data.plazo || 0
      };
      
      const response = await fetch(
        `/api/causas-imputados/${imputadoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar los datos del imputado');
      }

      toast({
        title: 'Éxito',
        description: 'Datos actualizados exitosamente'
      });
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al actualizar los datos'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Datos</DialogTitle>
          <DialogDescription>
            Datos del imputado en una causa
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isLoadingCautelares || isLoadingCausaImputado ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando datos...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="formalizado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel htmlFor="formalizado">Formalizado</FormLabel>
                        <FormDescription>
                          Indica si el imputado está formalizado
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFormalizadoChange(checked);
                          }}
                        />
                      </FormControl>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una medida cautelar" />
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

                {watchFormalizado && (
                  <>
                    <FormField
                      control={form.control}
                      name="fechaFormalizacion"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha Formalización</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Seleccione una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plazo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plazo de Investigación (días)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => handlePlazoChange(e)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ImputadoFormalizacionForm;