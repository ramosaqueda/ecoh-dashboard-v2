'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import GeneralForm from './components/GeneralForm';
import MiembrosForm from './components/MiembrosForm';
import CausasForm from './components/CausasForm';
import { organizacionSchema } from '@/schemas/organizacion.schema';
import {
  OrganizacionFormProps,
  OrganizacionFormValues,
  Miembro
} from '@/types/organizacion';

// Extender el tipo para incluir id opcional para modo edición
interface ExtendedOrganizacionFormProps extends OrganizacionFormProps {
  initialData?: Partial<OrganizacionFormValues> & {
    id?: number; // Agregar id opcional para modo edición
    miembros?: Miembro[];
    causas?: any[];
  };
}

function OrganizacionForm({ initialData, onSubmit }: ExtendedOrganizacionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  const [selectedMiembros, setSelectedMiembros] = useState<Miembro[]>(() => {
    if (!initialData?.miembros?.length) return [];

    return initialData.miembros.map((miembro) => ({
      ...((miembro as any).id && { id: (miembro as any).id }), // Safe access para id opcional
      ...((miembro as any).organizacionId && { organizacionId: (miembro as any).organizacionId }), // Safe access para organizacionId opcional
      imputadoId: miembro.imputadoId, // Ya es string según la interface
      rol: miembro.rol || '',
      orden: miembro.orden || 0,
      fechaIngreso: new Date(miembro.fechaIngreso),
      fechaSalida: miembro.fechaSalida ? new Date(miembro.fechaSalida) : null,
      activo: (miembro as any).activo ?? true, // Safe access para activo opcional
      imputado: (miembro as any).imputado
    }));
  });

  const { data: tiposOrganizacion = [] } = useQuery({
    queryKey: ['tipos-organizacion'],
    queryFn: async () => {
      const res = await fetch('/api/tipo-organizacion');
      return res.json();
    }
  });

  const { data: imputados = [] } = useQuery({
    queryKey: ['imputados'],
    queryFn: async () => {
      const res = await fetch('/api/imputado');
      return res.json();
    }
  });

  const form = useForm<OrganizacionFormValues>({
    resolver: zodResolver(organizacionSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      fechaIdentificacion: initialData?.fechaIdentificacion
        ? new Date(initialData.fechaIdentificacion)
        : new Date(),
      activa: initialData?.activa ?? true,
      tipoOrganizacionId: initialData?.tipoOrganizacionId?.toString() || ''
    }
  });

  const handleSubmit = async (data: OrganizacionFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Preparar datos de la organización
      const organizacionData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaIdentificacion: data.fechaIdentificacion.toISOString(),
        activa: data.activa,
        tipoOrganizacionId: parseInt(data.tipoOrganizacionId)
      };

      let organizacionResponse;

      if (initialData?.id) {
        // Modo edición
        organizacionResponse = await fetch(
          `/api/organizacion/${initialData.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(organizacionData)
          }
        ).then((res) => {
          if (!res.ok) throw new Error('Error al actualizar la organización');
          return res.json();
        });
      } else {
        // Modo creación
        organizacionResponse = await fetch('/api/organizacion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(organizacionData)
        }).then((res) => {
          if (!res.ok) throw new Error('Error al crear la organización');
          return res.json();
        });
      }

      // 2. Crear los nuevos miembros
      for (const miembro of selectedMiembros) {
        const miembroData = {
          organizacionId: organizacionResponse.id,
          imputadoId: miembro.imputadoId, // Ya es string
          rol: miembro.rol || '',
          fechaIngreso: miembro.fechaIngreso.toISOString(),
          fechaSalida: miembro.fechaSalida
            ? miembro.fechaSalida.toISOString()
            : null,
          activo: miembro.activo ?? true
        };

        console.log('Enviando miembro:', miembroData);

        const response = await fetch('/api/organizacion/miembros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(miembroData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar miembro');
        }
      }

      toast.success(
        `Organización ${
          initialData?.id ? 'actualizada' : 'creada'
        } exitosamente`
      );

      await onSubmit(organizacionResponse);
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Error al ${
              initialData?.id ? 'actualizar' : 'crear'
            } la organización`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMiembro = () => {
    setSelectedMiembros([
      ...selectedMiembros,
      {
        imputadoId: '',
        rol: '',
        orden: selectedMiembros.length,
        fechaIngreso: new Date(),
        fechaSalida: null,
        activo: true,
        imputado: undefined
      }
    ]);
  };

  const handleUpdateMiembro = (index: number, field: string, value: any) => {
    const newMiembros = [...selectedMiembros];
    newMiembros[index] = {
      ...newMiembros[index],
      [field]: value
    };
    setSelectedMiembros(newMiembros);
  };

  const handleRemoveMiembro = (index: number) => {
    setSelectedMiembros(selectedMiembros.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <Tabs
          defaultValue="general"
          className="w-full"
          value={currentTab}
          onValueChange={setCurrentTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="miembros" className="relative">
              Miembros
              {selectedMiembros.length > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {selectedMiembros.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="causas" className="relative">
              Causas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralForm form={form} tiposOrganizacion={tiposOrganizacion} />
          </TabsContent>

          <TabsContent value="miembros">
            <MiembrosForm
              miembros={selectedMiembros}
              imputados={imputados}
              isLoading={isSubmitting}
              onAddMiembro={handleAddMiembro}
              onUpdateMiembro={handleUpdateMiembro}
              onRemoveMiembro={handleRemoveMiembro}
            />
          </TabsContent>
          
          <TabsContent value="causas">
            {initialData?.id ? (
              <CausasForm 
                organization={{
                  id: initialData.id,
                  nombre: initialData.nombre || ''
                }}
                onClose={() => {
                  // En el contexto de tabs, no necesitamos cerrar nada
                  // Mantenemos vacío o podríamos cambiar de tab si fuera necesario
                }}
              />
            ) : (
              <div className="p-8 text-center border rounded-md bg-muted/10">
                <p className="text-muted-foreground">
                  Debe guardar la organización antes de poder asociar causas.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
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
      </div>
    </Form>
  );
}

export default OrganizacionForm;