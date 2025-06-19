// components/TelefonoCausaManager.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import CausaSelector from '@/components/select/CausaSelector';

interface Causa {
  id: number;
  ruc: string;
  denominacionCausa: string;
}

interface TelefonoCausa {
  id: number;
  causa: Causa;
}

interface TelefonoCausaManagerProps {
  telefonoId: number;
  initialCausas?: TelefonoCausa[];
  onCausaChange?: () => void;
  onUpdate?: (telefono: any) => void;
}

export function TelefonoCausaManager({
  telefonoId,
  initialCausas = [],
  onCausaChange,
  onUpdate
}: TelefonoCausaManagerProps) {
  const [causas, setCausas] = useState<Causa[]>([]);
  const [selectedCausaId, setSelectedCausaId] = useState<string>('');
  const [asociaciones, setAsociaciones] = useState<TelefonoCausa[]>(initialCausas);

  useEffect(() => {
    const fetchCausas = async (): Promise<void> => {
      try {
        const response = await fetch('/api/causas');
        if (!response.ok) throw new Error('Error al cargar causas');
        const data: Causa[] = await response.json();
        setCausas(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar las causas');
      }
    };

    fetchCausas();
  }, []);

  const handleAsociar = async (): Promise<void> => {
    if (!selectedCausaId) return;

    try {
      const response = await fetch('/api/telefonos-causa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idTelefono: telefonoId,
          idCausa: parseInt(selectedCausaId)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asociar causa');
      }

      const nuevaAsociacion: TelefonoCausa = await response.json();
      setAsociaciones((prev) => [...prev, nuevaAsociacion]);
      setSelectedCausaId('');
      toast.success('Causa asociada exitosamente');
      
      if (onCausaChange) {
        onCausaChange();
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al asociar la causa';
      toast.error(errorMessage);
    }
  };

  const handleDesasociar = async (asociacionId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/telefonos-causa/${asociacionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al desasociar causa');
      }

      setAsociaciones((prev) => prev.filter((a) => a.id !== asociacionId));
      toast.success('Causa desasociada exitosamente');
      
      if (onCausaChange) {
        onCausaChange();
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al desasociar la causa';
      toast.error(errorMessage);
    }
  };

  // Filtramos las causas que ya están asociadas
  const causasDisponibles = causas.filter(
    (causa) => !asociaciones.some((asoc) => asoc.causa.id === causa.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Causas Asociadas</h3>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <CausaSelector
            value={selectedCausaId}
            onChange={setSelectedCausaId}
            isDisabled={causasDisponibles.length === 0}
          />
        </div>
        <Button
          type="button"
          onClick={handleAsociar}
          disabled={!selectedCausaId || causasDisponibles.length === 0}
        >
          Asociar Causa
        </Button>
      </div>

      {asociaciones.length > 0 ? (
        <div className="space-y-2">
          {asociaciones.map((asociacion) => (
            <div
              key={asociacion.id}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex flex-col">
                <span className="font-medium">{asociacion.causa.ruc}</span>
                <span className="text-sm text-muted-foreground">
                  {asociacion.causa.denominacionCausa}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDesasociar(asociacion.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No hay causas asociadas
        </p>
      )}
    </div>
  );
}