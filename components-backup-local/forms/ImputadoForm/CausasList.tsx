import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CausaImputado } from '@/types/causaimputado';

interface CausasListProps {
  causas: CausaImputado[];
}

export const CausasList = ({ causas }: CausasListProps) => {
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
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {causas.map((causa) => (
              <div
                key={causa.causaId}
                className="rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">
                  
                    Causa {causa.causa?.ruc || 'Sin identificar'}
                  </h3>
                  <div className="space-x-2">
                    {causa.principalImputado && <Badge>Principal</Badge>}
                    <Badge
                            variant={causa.formalizado ? 'default' : 'secondary'} // ✅ Usar variantes válidas
                          >
                            {causa.formalizado ? 'Formalizado' : 'No Formalizado'}
                        </Badge>
                  </div>
                </div>
                {causa.fechaFormalizacion && (
                  <p className="text-sm text-muted-foreground">
                    Fecha Formalización:{' '}
                    {format(new Date(causa.fechaFormalizacion), 'dd/MM/yyyy')}
                  </p>
                )}
                {causa.cautelar && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      Medida Cautelar: {causa.cautelar.nombre}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
