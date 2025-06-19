'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type CausaImputado } from '@/types/causaimputado';
import {
  CalendarDays,
  GavelIcon,
  FileText,
  User,
  Scale,
  AlertCircle,  
  UserRoundSearch,
  Loader2,
  Hand
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';




interface CausasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  causas: CausaImputado[];
  nombreSujeto: string;
  onUpdateCausa?: (
    causaId: number,
    data: Partial<CausaImputado>
  ) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function CausasDrawer({
  isOpen,
  onClose,
  causas = [], // Valor por defecto
  nombreSujeto = '',
  onUpdateCausa,
  onRefresh
}: CausasDrawerProps) {
  const isLoading = !causas;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-0 sm:w-[540px]">
        <SheetHeader className="border-b p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <SheetTitle>Causas asociadas a {nombreSujeto}</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="space-y-6 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !Array.isArray(causas) || causas.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No hay causas asociadas a este sujeto
              </div>
            ) : (
              causas.map((causa) => (
                <div key={causa.id} className="rounded-lg border">
                  {/* Encabezado con datos de la causa */}
                  <div className="bg-muted/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          <FileText className="h-5 w-5" />
                          RUC: {causa.causa?.ruc || 'No disponible'}
                        </h3>
                        {causa.causa?.denominacionCausa && (
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Denominación:
                          </span>
                          <p className="text-sm">
                            {causa.causa.denominacionCausa}
                          </p>
                        </div>
                      )}
                        <div className="flex gap-2">
                          {causa.esImputado && (
                            <Badge className="bg-blue-500">
                              <Hand className="mr-1 h-3 w-3" />
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
                      </div>
                    </div>
                  </div>

                  {/* Contenido con detalles */}
                  <div className="space-y-4 p-4">
                    {/* Estado de formalización */}
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Estado de Formalización
                        </span>
                      </div>
                      <div className="pl-6">
                        <Badge
                          variant={causa.formalizado ? 'default' : 'secondary'}
                        >
                          {causa.formalizado ? 'Formalizado' : 'No Formalizado'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Fecha de formalización */}
                    {causa.formalizado && causa.fechaFormalizacion && (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Fecha Formalización:{' '}
                          {format(
                            new Date(causa.fechaFormalizacion),
                            'dd/MM/yyyy',
                            { locale: es }
                          )}
                        </span>
                      </div>
                    )}

                    {/* Medida Cautelar */}
                    {causa.cautelar && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                Medida Cautelar
                              </span>
                            </div>
                            <div className="grid gap-2 pl-6">
                              <Badge variant="outline" className="w-fit">
                                {causa.cautelar.nombre}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
