// app/Dashboard/imputado/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type Imputado } from '@/types/causaimputado'; // ✅ CORREGIDO: Importar directamente desde tipos
import { columns } from '@/components/tables/imputados-tables/columns'; // ✅ Solo importar columns
import { ImputadosDataTable } from '@/components/tables/imputados-tables/imputados-table';
import ImputadoFormContainer from '@/components/ImputadoFormContainer';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

async function getImputados(): Promise<Imputado[]> {
  const res = await fetch('/api/imputado', {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Error al cargar los imputados');
  }
  return res.json();
}

export default function ImputadosPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImputado, setSelectedImputado] = useState<Imputado | null>(null);
  const queryClient = useQueryClient();

  // ✅ Query tipada para obtener imputados
  const {
    data: imputados = [],
    isLoading,
    error
  } = useQuery<Imputado[]>({
    queryKey: ['imputados'],
    queryFn: getImputados
  });

  const handleEdit = (imputado: Imputado): void => {
    setSelectedImputado(imputado);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/imputado/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el imputado');
      }

      // Invalidar la cache después de eliminar
      queryClient.invalidateQueries({ queryKey: ['imputados'] });
      toast.success('Imputado eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el imputado');
    }
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setSelectedImputado(null);
  };

  const handleFormSuccess = (): void => {
    handleModalClose();
    // Invalidar la cache después de crear/editar
    queryClient.invalidateQueries({ queryKey: ['imputados'] });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando imputados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {error instanceof Error
            ? error.message
            : 'Error al cargar los imputados'}
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['imputados'] })
          }
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de imputados
          </h1>
          <p className="text-muted-foreground">
            Administre los imputados del sistema
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo imputado
        </Button>
      </div>

      <ImputadoFormContainer
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
        initialData={selectedImputado}
        isEditing={!!selectedImputado}
      />

      {imputados.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No hay imputados registrados</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            Crear primer imputado
          </Button>
        </div>
      ) : (
        <ImputadosDataTable
          columns={columns}
          data={imputados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDataChange={() =>
            queryClient.invalidateQueries({ queryKey: ['imputados'] })
          }
        />
      )}
    </div>
  );
}