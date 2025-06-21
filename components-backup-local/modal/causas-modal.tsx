// causas-modal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { type CausaImputado } from '@/types/causaimputado';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronDown, CalendarDays, GavelIcon, FileText } from 'lucide-react';
import { useState } from 'react';

// Interfaz extendida para la causa
interface CausaExtendida {
  ruc: string;
  denominacionCausa?: string;
  rit?: string;
  delito?: {
    id: number;
    nombre: string;
  };
  tribunal?: {
    id: number;
    nombre: string;
  };
}

// Interfaz extendida para CausaImputado
interface CausaImputadoExtendida extends Omit<CausaImputado, 'causa'> {
  causa?: CausaExtendida;
}

interface CausasModalProps {
  isOpen: boolean;
  onClose: () => void;
  causas: CausaImputadoExtendida[];
  nombreSujeto: string;
  onUpdateCausa?: (
    causaId: number,
    data: Partial<CausaImputado>
  ) => Promise<void>;
}

export function CausasModal({
  isOpen,
  onClose,
  causas,
  nombreSujeto,
  onUpdateCausa
}: CausasModalProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const handleSwitchChange = async (
    causaId: number,
    field: 'principalImputado' | 'formalizado',
    value: boolean
  ) => {
    if (!onUpdateCausa) return;

    try {
      setLoading(causaId);
      await onUpdateCausa(causaId, { [field]: value });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Causas asociadas a {nombreSujeto}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {causas.map((causa) => (
            <div key={causa.causaId} className="rounded-lg border p-4">
              {/* Encabezado de la causa */}
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {causa.causa?.denominacionCausa || 'Sin denominación'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {causa.causa?.ruc && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        RUC: {causa.causa.ruc}
                      </span>
                    )}
                    {causa.causa?.rit && (
                      <span className="flex items-center gap-1">
                        <GavelIcon className="h-4 w-4" />
                        RIT: {causa.causa.rit}
                      </span>
                    )}
                  </div>
                </div>
                {causa.causa?.delito && (
                  <Badge variant="secondary" className="h-fit">
                    {causa.causa.delito.nombre}
                  </Badge>
                )}
              </div>

              {/* Switches de estado */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`principal-${causa.causaId}`}
                    checked={causa.principalImputado}
                    disabled={loading === causa.causaId || !onUpdateCausa}
                    onCheckedChange={(checked) =>
                      handleSwitchChange(
                        causa.causaId,
                        'principalImputado',
                        checked
                      )
                    }
                  />
                  <Label htmlFor={`principal-${causa.causaId}`}>
                    Imputado Principal
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`formalizado-${causa.causaId}`}
                    checked={causa.formalizado}
                    disabled={loading === causa.causaId || !onUpdateCausa}
                    onCheckedChange={(checked) =>
                      handleSwitchChange(causa.causaId, 'formalizado', checked)
                    }
                  />
                  <Label htmlFor={`formalizado-${causa.causaId}`}>
                    Formalizado
                  </Label>
                </div>
              </div>

              {/* Fecha de formalización */}
              {causa.formalizado && causa.fechaFormalizacion && (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    Fecha Formalización:{' '}
                    {format(new Date(causa.fechaFormalizacion), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}

              {/* Información de Tribunal y Cautelar */}
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded p-2 hover:bg-accent">
                  <span className="text-sm font-medium">Ver más detalles</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="space-y-2 rounded-lg bg-accent/50 p-3">
                    {causa.causa?.tribunal && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Tribunal: {causa.causa.tribunal.nombre}
                        </Badge>
                      </div>
                    )}
                    {causa.cautelar && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Medida Cautelar: {causa.cautelar.nombre}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
          {causas.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              No hay causas asociadas a este imputado
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}