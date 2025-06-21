// components/drawer/causas-victimas-drawer.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Building, Scale, FileText, Loader2, AlertCircle } from 'lucide-react';
import { type CausaVictima } from '@/types/victima';

interface CausasVictimasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  victimaId: number; // Cambiar para recibir ID en lugar de causas
  nombreVictima: string;
  onUpdateCausa?: (causaId: number, data: any) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function CausasVictimasDrawer({
  isOpen,
  onClose,
  victimaId,
  nombreVictima,
  onRefresh
}: CausasVictimasDrawerProps) {
  const [causas, setCausas] = useState<CausaVictima[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar las causas de la víctima
  const fetchCausas = async () => {
    if (!victimaId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Drawer cargando causas para víctima:', victimaId);
      
      // Usar el mismo endpoint que funciona en el formulario
      const response = await fetch(`/api/causas-victimas/${victimaId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Drawer - Causas cargadas:', data.length, 'causas');
      setCausas(data);
    } catch (error) {
      console.error('❌ Error al cargar causas en drawer:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setCausas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar causas cuando se abre el drawer o cambia el ID
  useEffect(() => {
    if (isOpen && victimaId) {
      fetchCausas();
    }
  }, [isOpen, victimaId]);

  // Función para refrescar datos
  const handleRefresh = async () => {
    await fetchCausas();
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">
                Causas asociadas
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {nombreVictima} (ID: {victimaId})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Actualizar lista"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '↻'
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="px-4 pb-4 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Cargando causas...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Consultando: /api/causas-victimas/{victimaId}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-700 text-lg mb-2">Error al cargar causas</p>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="mt-2"
              >
                Reintentar
              </Button>
            </div>
          ) : causas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-2">
                No hay causas asociadas
              </p>
              <p className="text-sm text-muted-foreground">
                Esta víctima no tiene causas judiciales asociadas
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {causas.length} causa{causas.length > 1 ? 's' : ''} encontrada{causas.length > 1 ? 's' : ''}
                </p>
              </div>

              {causas.map((causa) => (
                <div
                  key={`${causa.causaId}-${causa.victimaId}`}
                  className="border rounded-lg p-4 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Encabezado de la causa */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {causa.causa.ruc || 'RUC no disponible'}
                        </h3>
                        {causa.causa.denominacionCausa && (
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {causa.causa.denominacionCausa}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 ml-4">
                        {causa.causa.delito && (
                          <Badge variant="outline" className="text-xs">
                            {causa.causa.delito.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Información detallada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información judicial */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Información Judicial
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        {causa.causa.tribunal ? (
                          <div className="flex items-start gap-2">
                            <Building className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium">Tribunal:</span>
                              <p className="text-gray-600">{causa.causa.tribunal.nombre}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <AlertCircle className="h-4 w-4" />
                            <span>Tribunal no especificado</span>
                          </div>
                        )}

                        {causa.causa.rit && (
                          <div>
                            <span className="font-medium">RIT:</span>
                            <span className="ml-2 text-gray-600">{causa.causa.rit}</span>
                          </div>
                        )}

                        <div>
                          <span className="font-medium">ID Causa:</span>
                          <span className="ml-2 text-gray-600">{causa.causa.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información de la relación */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Información de Asociación
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Causa ID:</span>
                          <span className="ml-2 text-gray-600">{causa.causaId}</span>
                        </div>

                        <div>
                          <span className="font-medium">Víctima ID:</span>
                          <span className="ml-2 text-gray-600">{causa.victimaId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de debug en desarrollo */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <Separator />
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <strong>Debug:</strong> CausaID: {causa.causaId} | VictimaID: {causa.victimaId} | API: /api/causas-victimas/{victimaId}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}