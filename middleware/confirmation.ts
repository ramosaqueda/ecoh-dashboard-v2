import { useToast } from '@/components/ui/use-toast';

export const withToast = (handler: Function) => {
  const { toast } = useToast();

  return async (...args: any[]) => {
    try {
      await handler(...args);
      toast({
        title: 'Éxito',
        description: 'Operación completada exitosamente'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Ha ocurrido un error'
      });
    }
  };
};

export const confirmDelete = async (
  message: string = '¿Está seguro de eliminar este elemento?'
): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};
