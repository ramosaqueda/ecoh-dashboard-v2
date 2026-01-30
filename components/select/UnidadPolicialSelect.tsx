import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface UnidadPolicial {
  id: number;
  nombre: string;
  institucion?: string | null;
}

interface UnidadPolicialSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function UnidadPolicialSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: UnidadPolicialSelectProps) {
  const [unidades, setUnidades] = useState<UnidadPolicial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchUnidades = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/unidad-policial`);
        if (!response.ok) {
          throw new Error('Error al cargar las Unidades Policiales');
        }
        const data = await response.json();
        setUnidades(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Unidades Policiales:', error);
        setFetchError(
          error instanceof Error ? error.message : 'Error al cargar las Unidades Policiales'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnidades();
  }, []);

  return (
    <div className="relative">
      <Select
        value={value ? value.toString() : undefined}
        onValueChange={onValueChange}
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
            <SelectValue placeholder="Selecciona una Unidad Policial" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Unidades...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : unidades.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Unidades disponibles
            </div>
          ) : (
            unidades.map((unidad) => (
              <SelectItem key={unidad.id} value={unidad.id.toString()}>
                {unidad.nombre} {unidad.institucion ? `(${unidad.institucion})` : ''}
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
}
