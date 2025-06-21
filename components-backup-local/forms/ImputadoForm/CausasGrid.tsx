'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { CausaImputado } from '@/types/causaimputado';
import { format } from 'date-fns';
import {
  FileText,
  CalendarDays,
  User,
  UserRoundSearch,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock
} from 'lucide-react';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

interface CausasGridProps {
  causas: CausaImputado[];
  imputadoId?: string;
  onRefresh?: () => Promise<void>;
}

export const CausasGrid = ({
  causas,
  imputadoId,
  onRefresh
}: CausasGridProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCausaId, setSelectedCausaId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteClick = (causaId: string) => {
    setSelectedCausaId(causaId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCausaId) {
      const [causaId, imputadoLocalId] = selectedCausaId.split('-');
      try {
        await deleteCausaImputado(causaId, imputadoLocalId);
        setDeleteDialogOpen(false);

        // Invalidar y actualizar la caché de las causas
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['causas-imputados', imputadoId]
          }),
          queryClient.invalidateQueries({
            queryKey: ['imputados']
          }),
          onRefresh?.()
        ]);

        toast({
          title: 'Éxito',
          description: 'Causa desvinculada exitosamente'
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Error al desvincular la causa'
        });
      }
    }
  };

  const deleteCausaImputado = async (causaId: string, imputadoId: string) => {
    await api.delete(`/causas-imputados`, {
      params: { causaId, imputadoId }
    });
  };

  if (causas.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No hay causas asociadas a este imputado
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {causas.map((causa) => (
            <AccordionItem
              key={causa.id}
              value={causa.id}
              className="rounded-lg border px-2"
            >
              <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{causa.causa?.ruc || 'Sin RUC'}</span>
                  </div>
                  <span className="truncate text-sm font-normal text-muted-foreground">
                    {causa.causa?.denominacionCausa || 'Sin denominación'}
                  </span>
                </div>
              </AccordionTrigger>

                 
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(causa.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  {/* Calidad del sujeto */}
                  <div className="flex flex-wrap items-center gap-2">
                    {causa.esImputado && (
                      <Badge className="bg-blue-500">
                        <User className="mr-1 h-3 w-3" />
                        Imputado
                      </Badge>
                    )}
                    {causa.essujetoInteres && (
                      <Badge variant="secondary" className="bg-amber-500">
                        <UserRoundSearch className="mr-1 h-3 w-3" />
                        Sujeto de Interés
                      </Badge>
                    )}
                  </div>

                  {/* Estado de formalización */}
                  <div className="flex items-center gap-2">
                    {causa.formalizado ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Formalizado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">No Formalizado</span>
                      </div>
                    )}
                  </div>

                  {/* Fecha de formalización */}
                  {causa.formalizado && causa.fechaFormalizacion && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Fecha de Formalización:{' '}
                        {format(
                          new Date(causa.fechaFormalizacion),
                          'dd/MM/yyyy'
                        )}
                      </span>
                    </div>
                  )}

                  {/* Plazo */}
                  {causa.plazo !== null && causa.plazo > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Plazo: {causa.plazo} días</span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desvinculará la causa del imputado y no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
