  'use client';

  import { useState, useEffect, useRef } from 'react';
  import { useParams, useRouter } from 'next/navigation';
  import { Chrono, ChronoRef, TimelineItem } from 'react-chrono';
  import { Button } from '@/components/ui/button';
  import { Plus, ArrowLeft, Trash2, Loader2, LayoutList, Split, Rows3 } from 'lucide-react';
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

  import '@/styles/timeline.css';

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

  type ChronoMode = 'VERTICAL' | 'VERTICAL_ALTERNATING' | 'HORIZONTAL';

  export default function TimelinePage({
    params
  }: {
    params: Promise<{ id: string }>;
  }) {
    const router = useRouter();
    const chronoRef = useRef<ChronoRef>(null);
    
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
    const [chronoMode, setChronoMode] = useState<ChronoMode>('VERTICAL_ALTERNATING');
    const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    useEffect(() => {
      params.then((resolvedParams) => {
        setId(resolvedParams.id);
        setIsParamsLoaded(true);
      });
    }, [params]);

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
      const fechaISO = new Date(hito.fecha);
      const fechaLocal = new Date(fechaISO.getTime() - fechaISO.getTimezoneOffset() * 60000);
      const fechaFormateada = fechaLocal.toISOString().slice(0, 16);
      
      setEditingHito({
        id: hito.id,
        titulo: hito.titulo.toString(),
        fecha: fechaFormateada,
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

    const scrollToHito = (date: string) => {
      setSelectedDate(date);
      const sortedHitos = hitos.sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      
      const index = sortedHitos.findIndex(h => h.fecha.split('T')[0] === date.split('T')[0]);
      
      if (index !== -1) {
        if (viewMode === 'chrono' && chronoRef.current) {
          chronoRef.current.scrollTo(index);
        }
        
        if (viewMode === 'list') {
          const element = document.getElementById(`hito-${sortedHitos[index].id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    const formatDateTime = (fecha: string) => {
      const date = new Date(fecha);
      return date.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const timelineItems: TimelineItem[] = hitos
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(hito => ({
        title: formatDateTime(hito.fecha),
        cardTitle: hito.titulo|| ':',

        cardDetailedText: hito.descripcion || '',
        media: hito.imagenUrl ? {
          source: {
            url: hito.imagenUrl
          },
          type: 'IMAGE' as const
        } : undefined,
      }));

    return (
      <div className="min-h-screen  bg-gray-50">
        {/* Contenedor centrado con ancho máximo */}
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
          {/* Header Section */}
          <div className="space-y-6 mb-8">
            {/* Botón de retorno y título */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/causas/view/${causaId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Línea de Tiempo
                  </h1>
                  {causa && (
                    <p className="text-sm text-gray-600 mt-1">
                      RUC: {causa.ruc} - {causa.partes}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex gap-3">
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
            
            {/* Timeline Navigation */}
            {hitos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <TimelineNav 
                  dates={hitos.map(h => h.fecha)}
                  onSelectDate={scrollToHito}
                  selectedDate={selectedDate}
                />
              </div>
            )}
          </div>

          {/* Alert Dialogs */}
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

          {/* Main Content */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'chrono' | 'list')}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="chrono">Vista Cronológica</TabsTrigger>
                <TabsTrigger value="list">Vista Lista</TabsTrigger>
              </TabsList>
              
              {viewMode === 'chrono' && hitos.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Modo:</span>
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Button
                      type="button"
                      variant={chronoMode === 'VERTICAL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChronoMode('VERTICAL')}
                      className="rounded-r-none"
                      title="Vertical"
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={chronoMode === 'VERTICAL_ALTERNATING' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChronoMode('VERTICAL_ALTERNATING')}
                      className="rounded-none border-l-0"
                      title="Alternado"
                    >
                      <Split className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={chronoMode === 'HORIZONTAL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChronoMode('HORIZONTAL')}
                      className="rounded-l-none border-l-0"
                      title="Horizontal"
                    >
                      <Rows3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : hitos.length > 0 ? (
              <>
                <TabsContent value="chrono" className="w-full">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div 
                      className="timeline-wrapper w-full"
                      style={{ 
                        minHeight: '800px',
                        height: 'auto',
                        padding: '24px 12px',
                        overflow: 'visible'
                      }}
                    >
                      <Chrono
                        items={timelineItems}                      
                        mode={chronoMode}
                        cardHeight={200}
                        cardWidth={360}
                        fontSizes={{
                          cardTitle: '1.125rem',
                          cardSubtitle: '0.875rem',
                          cardText: '0.875rem',
                          title: '0.8125rem',
                        }}
                        theme={{
                          primary: '#2563EB',
                          secondary: '#F3F4F6',
                          cardBgColor: '#ffffff',
                          cardForeColor: '#111827',
                          titleColor: '#2563EB',
                          titleColorActive: '#0066cc',
                        }}
                        scrollable={{ 
                          scrollbar: false 
                        }}
                        enableOutline={false}
                        useReadMore={false}
                        buttonTexts={{
                          first: 'Inicio',
                          last: 'Final',
                          next: 'Siguiente',
                          previous: 'Anterior',
                        }}
                        lineWidth={2}
                        ref={chronoRef}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="list">
                  <div className="max-w-4xl mx-auto space-y-4 pb-10">
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
              <div className="bg-white rounded-lg shadow-sm p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-6">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay hitos registrados
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Crea un nuevo hito para comenzar la línea de tiempo de esta causa.
                  </p>
                  <Button onClick={() => setDialogOpen(true)} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Crear Primer Hito
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    );
  }
