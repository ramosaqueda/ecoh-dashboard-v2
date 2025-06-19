// components/tables/CausasTable.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CausaImputado } from '@/types/causaimputado';
import { Causa } from '@/types/causaimputado'; // ← Importar el tipo Causa correcto
import {
  CalendarDays,
  GavelIcon,
  FileText,
  AlertCircle,
  Scale
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaz para CausaImputado usando el tipo Causa correcto
interface CausaImputadoConCausa extends Omit<CausaImputado, 'causa'> {
  causa?: Causa; // ← Usar el tipo Causa que ya existe con delito y tribunal
}

interface CausasTableProps {
  causas: CausaImputadoConCausa[];
}

export const CausasTable = ({ causas }: CausasTableProps) => {
  if (causas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            No hay causas asociadas a este imputado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Causas Asociadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">RUC</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Formalización</TableHead>
                <TableHead>Delito</TableHead>
                <TableHead>Medida Cautelar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {causas.map((causa) => (
                <TableRow key={causa.causaId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {causa.causa?.ruc || 'Sin RUC'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {causa.principalImputado && (
                        <Badge className="w-fit">Principal</Badge>
                      )}
                      <Badge
                        variant={causa.formalizado ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {causa.formalizado ? 'Formalizado' : 'No Formalizado'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {causa.formalizado && causa.fechaFormalizacion ? (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {format(
                          new Date(causa.fechaFormalizacion),
                          'dd/MM/yyyy'
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No formalizado
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {causa.causa?.delito ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              {causa.causa?.delito?.nombre || 'Delito no especificado'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{causa.causa?.delito?.nombre || 'Delito no especificado'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {causa.cautelar ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Scale className="h-3 w-3" />
                              {causa.cautelar.nombre}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{causa.cautelar.nombre}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};