import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from "@/components/ui/drawer";
  import { Button } from "@/components/ui/button";
  import { Loader2, Phone, User, Hash, CalendarClock, FileSpreadsheet } from "lucide-react";
  import { useState, useEffect } from "react";
  
  interface TelefonoDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    telefonoId: string | null;
  }
  
  export function TelefonoDrawer({ isOpen, onClose, telefonoId }: TelefonoDrawerProps) {
    const [telefono, setTelefono] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      const fetchTelefonoDetails = async () => {
        if (!telefonoId) return;
  
        setIsLoading(true);
        try {
          const id = telefonoId.replace('tel-', '');
          const response = await fetch(`/api/telefonos/${id}`);
          if (!response.ok) throw new Error('Error al cargar los detalles del teléfono');
          const data = await response.json();
          setTelefono(data);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      if (isOpen && telefonoId) {
        fetchTelefonoDetails();
      } else {
        setTelefono(null);
      }
    }, [isOpen, telefonoId]);
  
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader>
              <DrawerTitle>Detalles del Teléfono</DrawerTitle>
              <DrawerDescription>
                Información detallada del número telefónico
              </DrawerDescription>
            </DrawerHeader>
  
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : telefono ? (
              <div className="p-6 space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">Número Telefónico</h4>
                      <p className="text-lg">{telefono.numeroTelefonico || 'No especificado'}</p>
                    </div>
                  </div>
  
                  <div className="flex items-start gap-4">
                    <User className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">Abonado</h4>
                      <p className="text-lg">{telefono.abonado}</p>
                    </div>
                  </div>
  
                  <div className="flex items-start gap-4">
                    <Hash className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">IMEI</h4>
                      <p className="text-lg">{telefono.imei}</p>
                    </div>
                  </div>
  
                  <div className="flex items-start gap-4">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h4 className="font-medium">Proveedor de Servicio</h4>
                      <p className="text-lg">{telefono.proveedorServicio?.nombre}</p>
                    </div>
                  </div>
  
                  {/* Solicitudes */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Solicitudes</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${telefono.solicitaTrafico ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span>Solicita Tráfico</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${telefono.solicitaImei ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span>Solicita IMEI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${telefono.extraccionForense ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span>Extracción Forense</span>
                      </div>
                    </div>
                  </div>
  
                  {/* Causas asociadas */}
                  {telefono.telefonosCausa && telefono.telefonosCausa.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Causas Asociadas</h4>
                      <div className="space-y-2">
                        {telefono.telefonosCausa.map((tc: any) => (
                          <div key={tc.causa.id} className="p-3 rounded-lg border">
                            <p className="font-medium">{tc.causa.ruc}</p>
                            <p className="text-sm text-muted-foreground">{tc.causa.denominacionCausa}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
  
                  {/* Observaciones */}
                  {telefono.observacion && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Observaciones</h4>
                      <p className="text-muted-foreground">{telefono.observacion}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No se pudieron cargar los detalles del teléfono
              </div>
            )}
  
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }