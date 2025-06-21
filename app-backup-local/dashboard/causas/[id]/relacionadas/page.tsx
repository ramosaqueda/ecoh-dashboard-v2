'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import CausaRelacionadaForm from '@/components/forms/causa-relacionada/CausaRelacionadaForm';
import CausasGraph from '@/components/graph/CausasGraph';
import { Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

interface CausaRelacionada {
  id: number;
  causaMadre: {
    id: number;
    ruc: string;
    denominacionCausa: string;
  };
  causaArista: {
    id: number;
    ruc: string;
    denominacionCausa: string;
  };
  observacion: string;
  fechaRelacion: string;
}

interface CausaPrincipal {
  id: number;
  ruc: string;
  denominacionCausa: string;
}

export default function CausasRelacionadasPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ TODOS los hooks al inicio - ANTES de cualquier return condicional
  
  // Estados
  const [id, setId] = useState<string | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [relaciones, setRelaciones] = useState<CausaRelacionada[]>([]);
  const [causaPrincipal, setCausaPrincipal] = useState<CausaPrincipal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // ✅ useEffect para resolver params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      setIsParamsLoaded(true);
    });
  }, [params]);

  // ✅ useEffect para cargar dados (cuando tenemos el ID)
  useEffect(() => {
    if (!id) return;
    
    fetchCausaPrincipal();
    fetchRelaciones();
  }, [id]);

  // ✅ AHORA sí podemos hacer returns condicionales (después de todos los hooks)
  if (!isParamsLoaded || !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  const causaId = id as string;

  const fetchCausaPrincipal = async () => {
    try {
      const response = await fetch(`/api/causas/${causaId}`);
      if (!response.ok) throw new Error('Error al cargar causa principal');
      const data = await response.json();
      setCausaPrincipal(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar información de la causa principal');
    }
  };

  const fetchRelaciones = async () => {
    try {
      const response = await fetch(`/api/causas-relacionadas?causaId=${causaId}`);
      if (!response.ok) throw new Error('Error al cargar relaciones');
      const data = await response.json();
      setRelaciones(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las relaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/causas-relacionadas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al guardar la relación');

      await fetchRelaciones();
      toast.success('Relación creada exitosamente');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la relación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/causas-relacionadas?id=${deleteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar');
      
      await fetchRelaciones();
      toast.success('Relación eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la relación');
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Causas Relacionadas</CardTitle>
              {causaPrincipal && (
                <CardDescription>
                  Causa Principal: {causaPrincipal.ruc} - {causaPrincipal.denominacionCausa}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/causas">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Relacionar Nueva Causa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Relacionar Nueva Causa</DialogTitle>
                  </DialogHeader>
                  <CausaRelacionadaForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    causaId={causaId}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="graph" className="space-y-4">
            <TabsList>
              <TabsTrigger value="graph">Vista de Grafo</TabsTrigger>
              <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
            </TabsList>

            <TabsContent value="graph" className="min-h-[600px]">
              {causaPrincipal && relaciones.length > 0 ? (
                <CausasGraph
                  causaId={causaId}
                  relaciones={relaciones}
                  causaPrincipal={causaPrincipal}
                />
              ) : (
                <div className="flex h-[600px] items-center justify-center text-muted-foreground">
                  No hay causas relacionadas para visualizar
                </div>
              )}
            </TabsContent>

            <TabsContent value="table">
              {relaciones.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RUC</TableHead>
                        <TableHead>Denominación</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Fecha Relación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relaciones.map((relacion) => {
                        const causaRelacionada = relacion.causaMadre.id.toString() === causaId 
                          ? relacion.causaArista 
                          : relacion.causaMadre;
                          
                        return (
                          <TableRow key={relacion.id}>
                            <TableCell>{causaRelacionada.ruc}</TableCell>
                            <TableCell>{causaRelacionada.denominacionCausa}</TableCell>
                            <TableCell>{relacion.observacion}</TableCell>
                            <TableCell>
                              {new Date(relacion.fechaRelacion).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(relacion.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay causas relacionadas
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la relación entre las causas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}