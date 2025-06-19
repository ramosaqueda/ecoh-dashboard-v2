// hooks/use-imputados.ts
import { useState, useEffect } from 'react';
import { type Imputado } from '@/types/causaimputado';
import { useToast } from '@/components/ui/use-toast';

export const useImputados = () => {
  const [data, setData] = useState<Imputado[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchImputados = async () => {
    try {
      const response = await fetch('/api/imputado');
      if (!response.ok) throw new Error('Error al cargar imputados');

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los imputados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getImputado = async (id: number) => {
    try {
      const response = await fetch(`/api/imputado/${id}`);
      if (!response.ok) throw new Error('Error al cargar imputado');

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el imputado.'
      });
      return null;
    }
  };

  const createImputado = async (imputadoData: Partial<Imputado>) => {
    try {
      const response = await fetch('/api/imputado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imputadoData)
      });

      if (!response.ok) throw new Error('Error al crear imputado');

      await fetchImputados(); // Recargar la lista después de crear

      toast({
        title: 'Éxito',
        description: 'Imputado creado correctamente.'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el imputado.'
      });
    }
  };

  const updateImputado = async (
    id: number,
    imputadoData: Partial<Imputado>
  ) => {
    try {
      const response = await fetch(`/api/imputado/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imputadoData)
      });

      if (!response.ok) throw new Error('Error al actualizar imputado');

      await fetchImputados(); // Recargar la lista después de actualizar

      toast({
        title: 'Éxito',
        description: 'Imputado actualizado correctamente.'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el imputado.'
      });
    }
  };

  const deleteImputado = async (id: number) => {
    try {
      const response = await fetch(`/api/imputado/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar imputado');

      await fetchImputados(); // Recargar la lista después de eliminar

      toast({
        title: 'Éxito',
        description: 'Imputado eliminado correctamente.'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el imputado.'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchImputados();
  }, []);

  return {
    data,
    loading,
    fetchImputados,
    getImputado,
    createImputado,
    updateImputado,
    deleteImputado
  };
};
