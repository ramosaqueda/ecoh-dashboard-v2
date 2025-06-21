'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chrono, ChronoRef, TimelineItem } from 'react-chrono';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import HitoForm from '@/components/forms/hito/HitoForm';
import EnhancedHitoCard from '@/components/cards/EnhancedHitoCard';
import TimelineNav from '@/components/timeline/TimelineNav';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineHito {
  id: number;
  titulo: string;
  fecha: string;
  descripcion?: string;
  icono?: string;
  imagenUrl?: string;
  causaId: number;
  createdAt: string;
  updatedAt: string;
}

interface Causa {
  id: number;
  ruc: string;
  partes: string;
  fechaIngreso: string;
  tribunal: string;
}

interface HitoFormData {
  id?: number;
  titulo: string;
  fecha: string;
  descripcion?: string;
  icono?: string;
  imagenUrl?: string;
}

export default function TimelinePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ TODOS los hooks al inicio - ANTES de cualquier return condicional
  const router = useRouter();
  const chronoRef = useRef<ChronoRef>(null);
  
  // Estados
  const [id, setId] = useState<string | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [causa, setCausa] = useState<Causa | null>(null);
  const [hitos, setHitos] = useState<TimelineHito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHito, setEditingHito] = useState<HitoFormData | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chrono' | 'list'>('chrono');
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // ✅ useEffect para resolver params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      setIsParamsLoaded(true);
    });
  }, [params]);

  // ✅ Fetch causa details
  useEffect(() => {
    if (!id) return;
    
    const fetchCausa = async () => {
      try {
        const response = await fetch(`/api/causas/${id}`);
        if (!response.ok) throw new Error('Error al cargar la causa');
        const data = await response.json();
        setCausa(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar la información de la causa');
      }
    };
    
    fetchCausa();
  }, [id]);

  // ✅ Fetch timeline hitos
  useEffect(() => {
    if (!id) return;
    
    const fetchHitos = async () => {
      try {
        const response = await fetch(`/api/timeline-hitos?causaId=${id}`);
        if (!response.ok) throw new Error('Error al cargar los hitos');
        const data = await response.json();
        setHitos(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los hitos del timeline');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHitos();
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

  const handleSubmit = async (data: HitoFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingHito?.id 
        ? `/api/timeline-hitos?id=${editingHito.id}` 
        : '/api/timeline-hitos';

      const method = editingHito?.id ? 'PUT' : 'POST';
      
      const payload = {
        ...data,
        causaId: parseInt(causaId)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error al guardar el hito');
      
      const responseData = await response.json();
      
      // Update the local state
      if (editingHito?.id) {
        setHitos(hitos.map(h => h.id === editingHito.id ? responseData : h));
      } else {
        setHitos([...hitos, responseData]);
      }

      toast.success(
        editingHito?.id
          ? 'Hito actualizado exitosamente'
          : 'Hito creado exitosamente'
      );
      setDialogOpen(false);
      setEditingHito(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el hito');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hito: TimelineHito) => {
    setEditingHito({
      id: hito.id,
      titulo: hito.titulo.toString(),
      fecha: hito.fecha.split('T')[0],
      descripcion: hito.descripcion,
      icono: hito.icono,
      imagenUrl: hito.imagenUrl
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/timeline-hitos?id=${deleteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar');
      
      // Update the local state
      setHitos(hitos.filter(h => h.id !== deleteId));
      toast.success('Hito eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el hito');
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  // Función para eliminar todos los hitos
  const handleDeleteAllHitos = async () => {
    setIsDeletingAll(true);
    try {
      const response = await fetch(`/api/timeline-hitos/delete-all?causaId=${causaId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar los hitos');
      
      const data = await response.json();
      setHitos([]);
      toast.success(`Se eliminaron ${data.deletedCount} hitos exitosamente`);
      setShowDeleteAllAlert(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar los hitos');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Scroll to specific hito when selected in nav
  const scrollToHito = (date: string) => {
    setSelectedDate(date);
    
    // Find the index of the hito with this date
    const sortedHitos = [...hitos].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    const index = sortedHitos.findIndex(h => h.fecha.split('T')[0] === date.split('T')[0]);
    
    if (index !== -1) {
      // For chrono view, use the library's scrollTo method
      if (viewMode === 'chrono' && chronoRef.current) {
        chronoRef.current.scrollTo(index);
      }
      
      // For list view, scroll to the element
      if (viewMode === 'list') {
        const element = document.getElementById(`hito-${sortedHitos[index].id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Format timeline items for react-chrono with proper typing
  const timelineItems: TimelineItem[] = hitos
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(hito => ({
      title: new Date(hito.fecha).toLocaleDateString('es-CL'),
      cardTitle: hito.titulo,
      cardSubtitle: hito.descripcion || '',
      cardDetailedText: '',
      media: hito.imagenUrl ? {
        source: {
          url: hito.imagenUrl
        },
        type: 'IMAGE' as const
      } : undefined,
      timelineContent: (
        <EnhancedHitoCard 
          hito={hito} 
          onEdit={() => handleEdit(hito)} 
          onDelete={() => handleDelete(hito.id)} 
        />
      )
    }));

  return (
    <div className="space-y-6">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/causas/view/${causaId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Línea de Tiempo</h1>
              {causa && (
                <p className="text-sm text-gray-500">
                  Causa: {causa.ruc} - {causa.partes}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingHito(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Hito
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingHito ? 'Editar Hito' : 'Nuevo Hito'}
                  </DialogTitle>
                </DialogHeader>
                <HitoForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  initialData={editingHito}
                />
              </DialogContent>
            </Dialog>
            
            {hitos.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteAllAlert(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Línea de Tiempo
              </Button>
            )}
          </div>
        </div>
        
        {hitos.length > 0 && (
          <TimelineNav 
            dates={hitos.map(h => h.fecha)}
            onSelectDate={scrollToHito}
            selectedDate={selectedDate}
          />
        )}
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente el hito
              y los datos asociados.
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

      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar toda la línea de tiempo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todos los hitos de esta causa. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllHitos}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar Todo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chrono' | 'list')} className="px-6">
        <TabsList>
          <TabsTrigger value="chrono">Vista Cronológica</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="text-center py-10">Cargando línea de tiempo...</div>
        ) : hitos.length > 0 ? (
          <>
            <TabsContent value="chrono">
              <div className="w-full h-[600px]">
                <Chrono
                  items={timelineItems}
                  mode="VERTICAL_ALTERNATING"
                  buttonTexts={{
                    first: 'Principio',
                    last: 'Ultimo',
                    next: 'Siguiente',
                    previous: 'anterior'
                  }}
                  cardHeight={200}
                  theme={{
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--secondary))',
                    cardBgColor: 'hsl(var(--card))',
                    cardForeColor: 'hsl(var(--card-foreground))',
                    titleColor: 'hsl(var(--primary))',
                  }}
                  fontSizes={{
                    cardTitle: '1rem',
                    cardSubtitle: '0.85rem',
                    cardText: '0.8rem',
                    title: '0.8rem',
                  }}
                  enableOutline
                  ref={chronoRef}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="space-y-4 pb-10">
                {hitos.sort((a, b) => 
                  new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                ).map(hito => (
                  <div key={hito.id} id={`hito-${hito.id}`} className="w-full">
                    <EnhancedHitoCard 
                      hito={hito} 
                      onEdit={() => handleEdit(hito)} 
                      onDelete={() => handleDelete(hito.id)} 
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay hitos registrados para esta causa.</p>
            <p className="mt-2">Crea un nuevo hito para comenzar la línea de tiempo.</p>
          </div>
        )}
      </Tabs>
    </div>
  );
}