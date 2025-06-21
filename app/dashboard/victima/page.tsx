// app/dashboard/victima/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type Victima } from '@/types/victima';
import { columns } from '@/components/tables/victimas-tables/columns';
import { VictimasDataTable } from '@/components/tables/victimas-tables/victimas-table';
import VictimaFormContainer from '@/components/VictimaFormContainer';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Víctimas', link: '/dashboard/victima' }
];

async function getVictimas(): Promise<Victima[]> {
  const res = await fetch('/api/victima', {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Error al cargar las víctimas');
  }
  const response = await res.json();
  
  // Si la respuesta tiene estructura {data: [...], timestamp: "..."} extraer data
  return response.data || response;
}

export default function VictimasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVictima, setSelectedVictima] = useState<Victima | null>(null);
  const queryClient = useQueryClient();

  // Query tipada para obtener víctimas
  const {
    data: victimas = [],
    isLoading,
    error
  } = useQuery<Victima[]>({
    queryKey: ['victimas'],
    queryFn: getVictimas
  });

  const handleEdit = (victima: Victima): void => {
    setSelectedVictima(victima);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/victima?id=${id}`, {  // Usar query string
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la víctima');
      }

      // Invalidar la cache después de eliminar
      queryClient.invalidateQueries({ queryKey: ['victimas'] });
      toast.success('Víctima eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la víctima');
    }
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setSelectedVictima(null);
  };

  const handleFormSuccess = (): void => {
    handleModalClose();
    // Invalidar la cache después de crear/editar
    queryClient.invalidateQueries({ queryKey: ['victimas'] });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando víctimas...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-destructive">
            {error instanceof Error
              ? error.message
              : 'Error al cargar las víctimas'}
          </p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['victimas'] })
            }
          >
            Reintentar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto space-y-6 py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de víctimas
            </h1>
            <p className="text-muted-foreground">
              Administre las víctimas del sistema
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva víctima
          </Button>
        </div>

        <VictimaFormContainer
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleFormSuccess}
          initialData={selectedVictima}
          isEditing={!!selectedVictima}
        />

        {victimas.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              No hay víctimas registradas
            </p>
            <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
              Crear primera víctima
            </Button>
          </div>
        ) : (
          <VictimasDataTable
            columns={columns}
            data={victimas}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDataChange={() =>
              queryClient.invalidateQueries({ queryKey: ['victimas'] })
            }
          />
        )}
      </div>
    </PageContainer>
  );
}