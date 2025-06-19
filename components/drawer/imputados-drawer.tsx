import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight } from 'lucide-react';
import ImputadoFormalizacionForm from '@/components/forms/CausaImputadoForm/ImputadoFormalizacionForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getImputadoCausas } from '@/lib/services/imputadoService';

type CausaInfo = {
  id: number;
  ruc: string;
  denominacion?: string;
  fechaHecho?: string;
  delito?: string;
  esImputado?: boolean;
  esSujetoInteres?: boolean;
  formalizado?: boolean;
  fechaFormalizacion?: string | null;
  causaImputadoId?: string;
};

type ImputadoInfo = {
  id: string;
  causaId: number;
  imputadoId: number;
  esImputado: boolean;
  essujetoInteres: boolean;
  formalizado: boolean;
  fechaFormalizacion: string | null;
  plazo: number | null;
  cautelarId: number | null;
  imputado: {
    nombreSujeto: string;
    fotoPrincipal?: string;
  };
  causa: {
    ruc: string;
  };
  cautelar: {
    nombre: string;
  } | null;
  otrasCausas?: CausaInfo[];
};

interface ImputadosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  imputados: ImputadoInfo[];
  causaRuc: string;
}

export default function ImputadosDrawer({
  isOpen,
  onClose,
  imputados,
  causaRuc
}: ImputadosDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [imputadosConCausas, setImputadosConCausas] = useState<ImputadoInfo[]>(imputados);
  const [selectedImputado, setSelectedImputado] = useState<ImputadoInfo | null>(null);
  const [showCausasDialog, setShowCausasDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar las causas adicionales para cada imputado
  useEffect(() => {
    const cargarOtrasCausas = async () => {
      if (!isOpen || imputados.length === 0) return;
      
      setIsLoading(true);
      
      try {
        // Obtener causas adicionales para cada imputado
        const imputadosActualizados = await Promise.all(
          imputados.map(async (imputado) => {
            try {
              // Obtener todas las causas del imputado
              const causasImputado = await getImputadoCausas(imputado.imputadoId);
              
              // Filtrar para excluir la causa actual
              const otrasCausas = causasImputado.filter(
                (causa: CausaInfo) => causa.id !== imputado.causaId
              );
              
              // Si hay otras causas, actualizar el imputado con esta información
              if (otrasCausas.length > 0) {
                return {
                  ...imputado,
                  otrasCausas
                };
              }
              
              return imputado;
            } catch (error) {
              console.error(`Error al obtener causas para imputado ${imputado.imputadoId}:`, error);
              return imputado;
            }
          })
        );
        
        setImputadosConCausas(imputadosActualizados);
      } catch (error) {
        console.error("Error general al cargar causas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarOtrasCausas();
  }, [imputados, isOpen]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    onClose();
  };

  const handleShowOtrasCausas = (imputado: ImputadoInfo) => {
    setSelectedImputado(imputado);
    setShowCausasDialog(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Imputados de la Causa</SheetTitle>
            <SheetDescription>RUC: {causaRuc}</SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-4">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">
                Cargando información de imputados...
              </div>
            ) : imputadosConCausas.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No hay imputados registrados para esta causa.
              </div>
            ) : (
              <div className="space-y-4">
                {imputadosConCausas.map((registro) => (
                  <div
                    key={registro.id}
                    className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-4">
                      {registro.imputado.fotoPrincipal && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="flex-shrink-0">
                              <img
                                src={registro.imputado.fotoPrincipal}
                                alt={registro.imputado.nombreSujeto}
                                className="h-16 w-16 rounded-full object-cover cursor-pointer"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <div className="aspect-square w-full">
                              <img
                                src={registro.imputado.fotoPrincipal}
                                alt={registro.imputado.nombreSujeto}
                                className="h-full w-full object-contain rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      <div className="flex flex-grow items-center justify-between">
                        <h3 className="font-medium">
                          {registro.imputado.nombreSujeto}
                        </h3>
                        <div className="flex gap-2">
                          {registro.esImputado && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              Imputado
                            </Badge>
                          )}
                          {registro.essujetoInteres && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500 hover:bg-amber-600"
                            >
                              Sujeto de Interés
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alerta si el imputado está presente en otras causas */}
                    {registro.otrasCausas && registro.otrasCausas.length > 0 && (
                      <Alert className="my-2 cursor-pointer" variant="destructive" onClick={() => handleShowOtrasCausas(registro)}>
                        <AlertCircle className="h-4 w-4" />
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <AlertTitle>Imputado en múltiples causas</AlertTitle>
                            <AlertDescription>
                              Este imputado aparece en {registro.otrasCausas.length} causa{registro.otrasCausas.length !== 1 ? 's' : ''} adicional{registro.otrasCausas.length !== 1 ? 'es' : ''}
                            </AlertDescription>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Alert>
                    )}

                    <div className="mt-2 space-y-2 divide-y text-sm text-muted-foreground">
                      <div className="flex justify-between py-2">
                        <span>Formalizado:</span>
                        <span className="font-medium text-foreground" style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                          {registro.formalizado ? 'Sí' : 'No'}
                        <span className="flex justify-right">
                        <ImputadoFormalizacionForm
                          causaId={registro.causaId.toString()}
                          imputadoId={registro.imputadoId.toString()}
                          onSuccess={handleDrawerClose}
                        />
                      
                        </span>
                        </span>
                      </div>
                      {registro.fechaFormalizacion && (
                        <div className="flex justify-between py-2">
                          <span>Fecha Formalización:</span>
                          <span className="font-medium text-foreground">
                            {format(
                              new Date(registro.fechaFormalizacion),
                              'dd/MM/yyyy',
                              { locale: es }
                            )}
                          </span>
                        </div>
                      )}
                      {registro.plazo !== null && registro.plazo > 0 && (
                        <div className="flex justify-between py-2">
                          <span>Plazo:</span>
                          <span className="font-medium text-foreground">
                            {registro.plazo} días
                          </span>
                        </div>
                      )}
                      {registro.cautelar && (
                        <div className="flex justify-between pt-2">
                          <span>Medida Cautelar:</span>
                          <span className="font-medium text-foreground">
                            {registro.cautelar.nombre.trim()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4">
            <SheetClose asChild>
              <Button className="w-full" variant="outline">
                Cerrar
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo para mostrar otras causas */}
      <Dialog open={showCausasDialog} onOpenChange={setShowCausasDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Otras causas del imputado</DialogTitle>
          <DialogDescription>
            {selectedImputado?.imputado.nombreSujeto} aparece en las siguientes causas:
          </DialogDescription>
          
          <div className="mt-4 space-y-2">
            {selectedImputado?.otrasCausas?.map(causa => (
              <div key={causa.id} className="flex justify-between items-center rounded-lg border p-3">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold">RUC: </span>
                    {causa.ruc}
                  </div>
                  {causa.denominacion && (
                    <div className="text-sm text-muted-foreground">
                      {causa.denominacion}
                    </div>
                  )}
                  {causa.delito && (
                    <div className="text-xs">
                      <Badge variant="outline">{causa.delito}</Badge>
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    window.open(`/dashboard/causas/${causa.id}`, '_blank');
                  }}
                >
                  Ver causa
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}