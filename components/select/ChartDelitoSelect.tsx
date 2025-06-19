import React, { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Delito {
  id: number;
  nombre: string;
}

interface ChartDelitoSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Usar React.memo para evitar renderizados innecesarios
const ChartDelitoSelect = React.memo(({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false,
  placeholder = "Filtrar por tipo de delito"
}: ChartDelitoSelectProps) => {
  const [delitos, setDelitos] = useState<Delito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Usar una constante para la URL base en lugar de recrearla en cada renderizado
  const API_BASE_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', []);
  
  // Cargar los delitos cuando el componente se monta (solo una vez)
  useEffect(() => {
    let isMounted = true; // Para evitar actualizar el estado si el componente se desmonta
    
    const fetchDelitos = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setFetchError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/delito`);
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error('Error al cargar los tipos de delito');
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        setDelitos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching delitos:', error);
        
        if (!isMounted) return;
        
        setFetchError(
          error instanceof Error ? error.message : 'Error al cargar los tipos de delito'
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDelitos();
    
    // Cleanup para evitar actualizar estados en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]); // Solo depende de API_BASE_URL, que es estable

  // Handler para cambios de valor que asegura consistencia en el tipo
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
  };

  return (
    <div className="relative">
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={`${className} ${error ? 'border-red-500' : ''} ${
            isLoading ? 'opacity-50' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {/* Opción "Todos" siempre presente (usando "all" en lugar de cadena vacía) */}
          <SelectItem value="all">Todos los delitos</SelectItem>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando delitos...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : delitos.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay delitos disponibles
            </div>
          ) : (
            delitos.map((delito) => (
              <SelectItem key={delito.id} value={delito.id.toString()}>
                {delito.nombre}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <span className="mt-1 block text-sm text-red-500">{error}</span>
      )}
    </div>
  );
});

// Nombre para DevTools
ChartDelitoSelect.displayName = 'ChartDelitoSelect';

export default ChartDelitoSelect;