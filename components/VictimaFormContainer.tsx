// components/VictimaFormContainer.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import VictimaForm, { type VictimaFormValues } from '@/components/forms/VictimaForm';
import { toast } from 'sonner';
import { type Victima } from '@/types/victima';

interface VictimaFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Victima | null;
  isEditing: boolean;
}

export default function VictimaFormContainer({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEditing
}: VictimaFormContainerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: VictimaFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditing && initialData
        ? `/api/victima?id=${initialData.id}`  // Usar query string para PUT
        : '/api/victima';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la víctima');
      }

      toast.success(
        isEditing
          ? 'Víctima actualizada exitosamente'
          : 'Víctima creada exitosamente'
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al guardar la víctima'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ CORRECTO:
  const defaultValues = initialData ? {
    nombreVictima: initialData.nombreVictima,
    docId: initialData.docId,
    nacionalidadId: initialData.nacionalidadId?.toString() || '',
    // REMOVIDOS: alias y caracteristicas
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Víctima' : 'Nueva Víctima'}
          </DialogTitle>
        </DialogHeader>
        <VictimaForm
          initialValues={defaultValues}  // ✅ Usar la variable correcta
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          victimaId={initialData?.id.toString()}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}