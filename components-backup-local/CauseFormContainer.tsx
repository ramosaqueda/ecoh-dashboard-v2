import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CausaForm from '@/components/forms/CausaForm/';

import { toast } from 'sonner';
import { causaService, ApiError } from '@/lib/services/causaService';
import type { CausaFormData, Causa } from '@/types/causa';
import { Loader2 } from 'lucide-react';

// ✅ Tipo más robusto que acepta cualquier objeto con id opcional
interface CauseFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { id?: string | number; [key: string]: any } | null | undefined;
  isEditing?: boolean;
}

// ✅ Función helper para transformar null a undefined
const transformNullToUndefined = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  (Object.keys(result) as Array<keyof T>).forEach(key => {
    if (result[key] === null) {
      result[key] = undefined as T[keyof T];
    }
  });
  return result;
};

const CauseFormContainer: React.FC<CauseFormContainerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing = false
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<CausaFormData>>({});

  // ✅ Cargar datos iniciales si estamos editando
  React.useEffect(() => {
    const loadInitialData = async () => {
      if (isEditing && initialData?.id) {
        try {
          setIsLoading(true);
          setError(null);
          
          // ✅ Convertir id a number solo para la llamada a la API
          const causaId = typeof initialData.id === 'string' 
            ? parseInt(initialData.id, 10) 
            : initialData.id;
            
          if (isNaN(causaId)) {
            throw new Error('ID de causa inválido');
          }
          
          const causa = await causaService.getById(causaId);
          const transformedData = causaService.transformInitialData(causa);
          
          // ✅ Transformar null a undefined para compatibilidad con el tipo
          const cleanedData = transformNullToUndefined(transformedData) as Partial<CausaFormData>;
          setFormData(cleanedData);
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : 'Error al cargar los datos de la causa';
          setError(message);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFormData({});
      }
    };

    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, isEditing, initialData]);

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setFormData({});
      onClose();
    }
  };

  const handleSubmit = async (data: CausaFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditing && initialData?.id) {
        // ✅ Convertir id a number si es necesario para el servicio
        const causaId = typeof initialData.id === 'string' 
          ? parseInt(initialData.id, 10) 
          : initialData.id;
          
        if (isNaN(causaId)) {
          throw new Error('ID de causa inválido');
        }
        
        await causaService.update(causaId, data);
        toast.success('Causa actualizada exitosamente');
      } else {
        await causaService.create(data);
        toast.success('Causa creada exitosamente');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Error al ${isEditing ? 'actualizar' : 'crear'} la causa`;
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar estados de carga y error
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-48 flex-col items-center justify-center gap-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={handleClose} variant="outline">
            Cerrar
          </Button>
        </div>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Editar Causa' : 'Nueva Causa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos de la causa existente'
              : 'Complete el formulario para crear una nueva causa'}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-1">
          <CausaForm
            initialValues={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] max-w-6xl overflow-hidden p-6"
        onInteractOutside={(e) => {
          // Prevenir cierre al hacer clic fuera si está enviando
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevenir cierre con ESC si está enviando
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default CauseFormContainer;