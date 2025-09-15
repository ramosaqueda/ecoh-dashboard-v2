'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ActividadForm from '@/components/forms/actividad/ActividadForm';
import ActividadesTable from '@/components/tables/actividades-tables/ActividadesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
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

interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
  };
  tipoActividad: {
    id: number;
    nombre: string;
  };
  fechaInicio: string;
  fechaTermino: string;
  observacion: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: {
    email: string;
  };
}

interface ActividadEditing {
  id: number;
  causaId: string;
  tipoActividadId: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  observacion?: string;
}

interface TipoActividad {
  id: number;
  nombre: string;
}

export default function ActividadesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [tiposActividad, setTiposActividad] = useState<TipoActividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rucFilter, setRucFilter] = useState('');
  const [tipoActividadFilter, setTipoActividadFilter] = useState('all');
  const [actividadEditing, setActividadEditing] = useState<ActividadEditing | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Estados para highlight functionality
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [highlightFound, setHighlightFound] = useState(false);
  const [searchingHighlight, setSearchingHighlight] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Leer parámetro highlight de la URL
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight && !isNaN(Number(highlight))) {
      const id = Number(highlight);
      setHighlightId(id);
      setSearchingHighlight(true);
      
      // Mostrar mensaje de búsqueda
      toast.info(`Buscando actividad #${id}...`, {
        duration: 3000,
      });
    }
  }, [searchParams]);

  // Verificar si la actividad highlight está en los resultados actuales
  useEffect(() => {
    if (highlightId && actividades.length > 0 && !highlightFound) {
      const foundActivity = actividades.find(act => act.id === highlightId);
      if (foundActivity) {
        setHighlightFound(true);
        setSearchingHighlight(false);
        
        // Scroll a la actividad después de un breve delay
        setTimeout(() => {
          const element = document.getElementById(`actividad-row-${highlightId}`);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            // Mostrar notificación de éxito
            toast.success(`Actividad #${highlightId} encontrada y resaltada`, {
              duration: 4000,
            });
          }
        }, 500);
      } else if (searchingHighlight && !hasMore) {
        // Si llegamos al final y no encontramos la actividad
        setSearchingHighlight(false);
        toast.error(`Actividad #${highlightId} no encontrada`, {
          duration: 4000,
        });
      }
    }
  }, [actividades, highlightId, highlightFound, searchingHighlight, hasMore]);

  // Auto-cargar más páginas si estamos buscando una actividad específica
  useEffect(() => {
    if (searchingHighlight && !highlightFound && hasMore && !isLoadingMore) {
      const timer = setTimeout(() => {
        setPage(prev => prev + 1);
      }, 1000); // Delay para evitar sobrecarga

      return () => clearTimeout(timer);
    }
  }, [searchingHighlight, highlightFound, hasMore, isLoadingMore]);

  const fetchTiposActividad = async () => {
    try {
      const response = await fetch('/api/tipos-actividad');
      if (!response.ok) throw new Error('Error al cargar tipos de actividad');
      const data = await response.json();
      setTiposActividad(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los tipos de actividad');
    }
  };

  const fetchActividades = async (ruc?: string, tipoId?: string, pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoadingMore(pageNum > 1);
      const params = new URLSearchParams();
      
      if (ruc) {
        params.append('ruc', ruc);
      }
      
      if (tipoId && tipoId !== 'all') {
        params.append('tipo_actividad_id', tipoId);
      }

      params.append('page', pageNum.toString());
      params.append('limit', '10');

      const url = `/api/actividades?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar actividades');
      const { data, metadata } = await response.json();
      
      setTotalRecords(metadata.total);
      setHasMore(metadata.hasMore);
      setActividades(prev => append ? [...prev, ...data] : data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !searchingHighlight) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, searchingHighlight]);

  useEffect(() => {
    if (page > 1) {
      fetchActividades(rucFilter, tipoActividadFilter, page, true);
    }
  }, [page]);

  useEffect(() => {
    fetchTiposActividad();
    fetchActividades(undefined, undefined, 1, false);
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = actividadEditing
        ? `/api/actividades?id=${actividadEditing.id}`
        : '/api/actividades';

      const method = actividadEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al guardar la actividad');

      setPage(1);
      await fetchActividades(rucFilter, tipoActividadFilter, 1, false);
      toast.success(
        actividadEditing
          ? 'Actividad actualizada exitosamente'
          : 'Actividad creada exitosamente'
      );
      setDialogOpen(false);
      setActividadEditing(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la actividad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setHighlightFound(false); // Reset highlight when searching
    fetchActividades(rucFilter, tipoActividadFilter, 1, false);
  };

  const handleClearFilters = () => {
    setRucFilter('');
    setTipoActividadFilter('all');
    setPage(1);
    setHighlightFound(false); // Reset highlight when clearing filters
    fetchActividades(undefined, undefined, 1, false);
  };

  // Función para limpiar el highlight de la URL
  const clearHighlight = () => {
    setHighlightId(null);
    setHighlightFound(false);
    setSearchingHighlight(false);
    
    // Remover parámetro de la URL
    const url = new URL(window.location.href);
    url.searchParams.delete('highlight');
    router.replace(url.pathname + url.search, { scroll: false });
    
    toast.info('Resaltado removido');
  };

  const handleEdit = (actividad: Actividad) => {
    setActividadEditing({
      id: actividad.id,
      causaId: actividad.causa.id.toString(),
      tipoActividadId: actividad.tipoActividad.id.toString(),
      fechaInicio: actividad.fechaInicio.split('T')[0],
      fechaTermino: actividad.fechaTermino.split('T')[0],
      estado: actividad.estado,
      observacion: actividad.observacion
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/actividades?id=${deleteId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      setPage(1);
      await fetchActividades(rucFilter, tipoActividadFilter, 1, false);
      toast.success('Actividad eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la actividad');
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Actividades</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setActividadEditing(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {actividadEditing ? 'Editar Actividad' : 'Nueva Actividad'}
              </DialogTitle>
            </DialogHeader>
            <ActividadForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialData={actividadEditing}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Banner de highlight activo */}
      {highlightId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium">
              {searchingHighlight 
                ? `Buscando actividad #${highlightId}...` 
                : highlightFound 
                ? `Actividad #${highlightId} resaltada`
                : `Actividad #${highlightId} no encontrada`
              }
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHighlight}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Buscar por RUC..."
            value={rucFilter}
            onChange={(e) => setRucFilter(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={tipoActividadFilter}
            onValueChange={setTipoActividadFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Actividad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {tiposActividad.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="secondary">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
        {(rucFilter || tipoActividadFilter !== 'all') && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearFilters}
          >
            Limpiar
          </Button>
        )}
      </form>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esta acción eliminará permanentemente la actividad
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

      {isLoading ? (
        <div className="text-center">Cargando actividades...</div>
      ) : (
        <>
          <ActividadesTable
            actividades={actividades}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalRegistros={totalRecords}
            registrosMostrados={actividades.length}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => setPage(page + 1)}
            hasMore={hasMore}
            highlightId={highlightId}
          />
          
          {hasMore && (
            <div
              ref={observerTarget}
              className="w-full py-4 text-center"
            >
              {isLoadingMore ? (
                <div>
                  {searchingHighlight 
                    ? `Cargando más actividades (buscando #${highlightId})...`
                    : 'Cargando más actividades...'
                  }
                </div>
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
