// components/forms/causa-relacionada/CausaRelacionadaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CausaSelector from '@/components/select/CausaSelector';
import { toast } from 'sonner';

interface CausaRelacionadaFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  causaId?: string;
}

export default function CausaRelacionadaForm({
  onSubmit,
  isSubmitting,
  causaId
}: CausaRelacionadaFormProps) {
  const [selectedCausaId, setSelectedCausaId] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Efecto para validar cuando cambia la selección
  useEffect(() => {
    if (selectedCausaId === causaId) {
      setError('No puedes seleccionar la misma causa como relación');
      // Opcional: Limpiar la selección automáticamente
      setSelectedCausaId('');
      toast.error('No puedes seleccionar la misma causa como relación');
    } else {
      setError(null);
    }
  }, [selectedCausaId, causaId]);

  const handleCausaSelect = (newSelectedId: string) => {
    if (newSelectedId === causaId) {
      toast.error('No puedes seleccionar la misma causa como relación');
      return;
    }
    setSelectedCausaId(newSelectedId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación antes de enviar
    if (!selectedCausaId) {
      toast.error('Debes seleccionar una causa');
      return;
    }

    if (selectedCausaId === causaId) {
      toast.error('No puedes relacionar una causa consigo misma');
      return;
    }

    if (!observacion.trim()) {
      toast.error('Debes ingresar un motivo para la relación');
      return;
    }

    try {
      await onSubmit({
        causaMadreId: causaId,
        causaAristaId: selectedCausaId,
        observacion
      });

      // Limpiar formulario solo si la operación fue exitosa
      setSelectedCausaId('');
      setObservacion('');
      setError(null);
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Seleccionar Causa</Label>
        <div className="space-y-1">
          <CausaSelector
            value={selectedCausaId}
            onChange={handleCausaSelect}
            isDisabled={isSubmitting}
            error={error || undefined}
          />
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacion">Motivo de la Relación</Label>
        <Textarea
          id="observacion"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Ingrese el motivo de la relación..."
          disabled={isSubmitting}
          required
          rows={4}
          className={(!observacion.trim() && 'border-red-500') || undefined}

        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedCausaId || !observacion.trim() || !!error}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Relación'}
        </Button>
      </div>
    </form>
  );
}