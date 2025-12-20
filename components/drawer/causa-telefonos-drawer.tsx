import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Phone, User, Building2 } from 'lucide-react';

interface CausaTelefonosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  causa: any; // Using any for now to avoid strict type issues with the new relation
}

export function CausaTelefonosDrawer({
  isOpen,
  onClose,
  causa
}: CausaTelefonosDrawerProps) {
  const telefonosAsociados = causa?.telefonos || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Teléfonos asociados a la Causa
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {causa?.ruc} - {causa?.denominacionCausa}
            </div>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {telefonosAsociados.length > 0 ? (
              telefonosAsociados.map((item: any) => (
                <div key={item.id} className="space-y-3 rounded-lg border p-4 bg-card">
                  <div className="flex items-center gap-2 font-medium text-lg">
                    <Phone className="h-4 w-4 text-blue-600" />
                    {item.telefono.numeroTelefonico || 'S/N'}
                  </div>
                  
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-foreground">Abonado:</span>
                      {item.telefono.abonado || 'No registrado'}
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium text-foreground">Proveedor:</span>
                      {item.telefono.proveedorServicio?.nombre || 'No registrado'}
                    </div>

                    {item.telefono.imei && (
                      <div className="text-xs text-muted-foreground mt-1">
                        IMEI: {item.telefono.imei}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    {item.telefono.solicitaTrafico && (
                      <Badge variant="secondary" className="text-xs">Tráfico</Badge>
                    )}
                    {item.telefono.solicitaImei && (
                      <Badge variant="secondary" className="text-xs">IMEI</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Phone className="h-12 w-12 mb-4 opacity-20" />
                <p>No hay teléfonos asociados a esta causa</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
