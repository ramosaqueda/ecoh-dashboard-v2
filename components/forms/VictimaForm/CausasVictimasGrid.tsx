// components/forms/VictimaForm/CausasVictimasGrid.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';           // ✅ AGREGAR ESTA LÍNEA
import { es } from 'date-fns/locale';        // ✅ AGREGAR ESTA LÍNEA
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Building, 
  Trash2, 
  Loader2
} from 'lucide-react';
import { type CausaVictima } from '@/types/victima';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CausasVictimasGridProps {
  causas: CausaVictima[];
  victimaId: string;
  isLoading?: boolean;
}

export function CausasVictimasGrid({ 
  causas, 
  victimaId, 
  isLoading = false 
}: CausasVictimasGridProps) {
  const [deletingCausa, setDeletingCausa] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [causaToDelete, setCausaToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Función para invalidar queries relacionadas
  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['causas-victimas', victimaId] }),
      queryClient.invalidateQueries({ queryKey: ['victimas'] }),
      queryClient.invalidateQueries({ queryKey: ['victima', victimaId] })
    ]);
  };

  const handleDeleteClick = (causaVictimaKey: string) => {
    setCausaToDelete(causaVictimaKey);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!causaToDelete) return;

    setDeletingCausa(causaToDelete);
    
    try {
      // Extraer causaId y victimaId del string compuesto
      const [causaIdStr, victimaIdStr] = causaToDelete.split('-');
      const causaId = parseInt(causaIdStr);
      const victimaId = parseInt(victimaIdStr);

      console.log(`Eliminando relación causa-víctima: CausaID ${causaId}, VictimaID ${victimaId}`);

      // 🔥 NUEVA RUTA SIMPLE: /api/causas-victimas con query params
      const response = await fetch(`/api/causas-victimas?causaId=${causaId}&victimaId=${victimaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al desasociar la causa');
      }

      // Invalidar queries para refrescar datos
      await invalidateQueries();

      toast.success('Causa desasociada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al desasociar la causa'
      );
    } finally {
      setDeletingCausa(null);
      setShowDeleteAlert(false);
      setCausaToDelete(null);
    }
  };

  // Función auxiliar para formatear fechas de manera segura
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      return format(new Date(dateString), "d 'de' MMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  // Mostrar loading si está cargando
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Cargando causas asociadas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar mensaje si no hay causas
  if (causas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No hay causas asociadas a esta víctima
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Usa el botón "Asociar Causa" para agregar causas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {causas.map((causa) => (
          <Card key={`${causa.causaId}-${causa.victimaId}`} className="relative">
            {/* Loading overlay */}
            {deletingCausa === `${causa.causaId}-${causa.victimaId}` && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">
                    {causa.causa.ruc || 'RUC no disponible'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {causa.causa.denominacionCausa || 'Sin denominación'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(`${causa.causaId}-${causa.victimaId}`)}
                    disabled={deletingCausa === `${causa.causaId}-${causa.victimaId}`}
                    title="Desasociar causa"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {causa.causa.delito && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {causa.causa.delito.nombre}
                    </Badge>
                  </div>
                )}
                
                {causa.causa.tribunal && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">
                      {causa.causa.tribunal.nombre}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />
              
              {/* Información básica de la relación */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">
                  Información de la asociación:
                </h4>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Causa ID:</strong> {causa.causa.id}
                  </p>
                  <p>
                    <strong>Víctima ID:</strong> {causa.victimaId}
                  </p>
                  {causa.causa.rit && (
                    <p>
                      <strong>RIT:</strong> {causa.causa.rit}
                    </p>
                  )}
                </div>
              </div>

              {/* Información de debug (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                  <strong>Debug:</strong> CausaID: {causa.causaId} | VictimaID: {causa.victimaId}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Dialog para confirmación de eliminación */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasociar esta causa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la asociación entre la víctima y la causa seleccionada. 
              Los datos de la causa se mantendrán, pero ya no estará asociada a esta víctima.
              
              <strong className="block mt-2">Esta acción no se puede deshacer.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCausaToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingCausa !== null}
            >
              {deletingCausa !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desasociando...
                </>
              ) : (
                'Desasociar causa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}