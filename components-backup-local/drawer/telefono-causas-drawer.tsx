// components/tables/telefono-tables/telefono-causas-drawer.tsx
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Telefono } from '@/components/tables/telefono-tables/columns';

interface TelefonoCausasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telefono: Telefono;
}

export function TelefonoCausasDrawer({
  isOpen,
  onClose,
  telefono
}: TelefonoCausasDrawerProps) {
  const causasAsociadas = telefono.telefonosCausa || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Causas asociadas al teléfono {telefono.numeroTelefonico}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {causasAsociadas.length > 0 ? (
              causasAsociadas.map((tc) => (
                <div key={tc.id} className="space-y-2 rounded-lg border p-4">
                  <div className="font-medium">RUC: {tc.causa.ruc}</div>
                  <div>{tc.causa.denominacionCausa}</div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No hay causas asociadas a este teléfono
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
