// components/forms/CausaVictimaForm/CausaVictimaContainer.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger
// } from '@/components/ui/popover';
// import { CalendarIcon, Loader2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CausaSelector from '@/components/select/CausaSelector';

interface CausaVictimaContainerProps {
  victimaId: string;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export default function CausaVictimaContainer({
  victimaId,
  onSuccess,
  trigger
}: CausaVictimaContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCausaId, setSelectedCausaId] = useState('');
  // Estados comentados hasta que se agreguen al esquema Prisma
  // const [fechaDenuncia, setFechaDenuncia] = useState<Date>();
  // const [esVictima, setEsVictima] = useState(true);
  // const [esDenunciante, setEsDenunciante] = useState(false);
  // const [esQuerellanteAdhesivo, setEsQuerellanteAdhesivo] = useState(false);
  // const [observaciones, setObservaciones] = useState('');

  const handleSubmit = async () => {
    if (!selectedCausaId) {
      toast.error('Debe seleccionar una causa');
      return;
    }

    // Por ahora comentamos la validación de roles ya que el esquema de Prisma no incluye estos campos
    // if (!esVictima && !esDenunciante && !esQuerellanteAdhesivo) {
    //   toast.error('Debe seleccionar al menos un rol en la causa');
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/causas-victimas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          victimaId: parseInt(victimaId),
          causaId: parseInt(selectedCausaId)
          // Comentamos los campos adicionales hasta que se agreguen al esquema Prisma
          // esVictima,
          // esDenunciante,
          // esQuerellanteAdhesivo,
          // fechaDenuncia: fechaDenuncia?.toISOString(),
          // observaciones: observaciones.trim() || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al asociar la causa');
      }

      toast.success('Causa asociada exitosamente');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al asociar la causa'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCausaId('');
    // Estados comentados hasta que se agreguen al esquema Prisma
    // setFechaDenuncia(undefined);
    // setEsVictima(true);
    // setEsDenunciante(false);
    // setEsQuerellanteAdhesivo(false);
    // setObservaciones('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asociar Causa a Víctima</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de causa usando CausaSelector */}
          <div className="space-y-2">
            <Label htmlFor="causa-selector">Seleccionar causa</Label>
            <CausaSelector
              value={selectedCausaId}
              onChange={setSelectedCausaId}
            />
          </div>

          {selectedCausaId && (
            <>
              <Separator />

              {/* Campos adicionales comentados hasta que se agreguen al esquema Prisma */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Los campos adicionales (roles, fecha de denuncia, observaciones) 
                  están disponibles en la UI pero comentados hasta que se agreguen al esquema de Prisma.
                </p>
              </div>

              {/* Roles en la causa - COMENTADO POR AHORA */}
              {/* <div className="space-y-4">
                <Label>Roles en la causa:</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="es-victima">Es víctima</Label>
                    <Switch
                      id="es-victima"
                      checked={esVictima}
                      onCheckedChange={setEsVictima}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="es-denunciante">Es denunciante</Label>
                    <Switch
                      id="es-denunciante"
                      checked={esDenunciante}
                      onCheckedChange={setEsDenunciante}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="es-querellante">Es querellante adhesivo</Label>
                    <Switch
                      id="es-querellante"
                      checked={esQuerellanteAdhesivo}
                      onCheckedChange={setEsQuerellanteAdhesivo}
                    />
                  </div>
                </div>
              </div> */}

              {/* Fecha de denuncia - COMENTADO POR AHORA */}
              {/* <div className="space-y-2">
                <Label>Fecha de denuncia (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaDenuncia && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaDenuncia ? (
                        format(fechaDenuncia, "d 'de' MMMM 'de' yyyy", { locale: es })
                      ) : (
                        "Seleccionar fecha"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fechaDenuncia}
                      onSelect={setFechaDenuncia}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div> */}

              {/* Observaciones - COMENTADO POR AHORA */}
              {/* <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ingrese observaciones adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div> */}

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedCausaId}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Asociando...
                    </>
                  ) : (
                    'Asociar causa'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}