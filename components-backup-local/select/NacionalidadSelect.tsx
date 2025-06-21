import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Nacionalidad {
  id: number;
  nombre: string;
}

interface NacionalidadSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function NacionalidadSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: NacionalidadSelectProps) {
  const [Nacionalidads, setNacionalidads] = useState<Nacionalidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
  // Cargar los Nacionalidads cuando el componente se monta
  useEffect(() => {
    const fetchNacionalidads = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/nacionalidad`);

        if (!response.ok) {
          throw new Error('Error al cargar los Nacionalidads');
        }
        const data = await response.json();
        setNacionalidads(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Nacionalidads:', error);
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Error al cargar los Nacionalidads'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNacionalidads();
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
            <SelectValue placeholder="Selecciona un Nacionalidad" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Nacionalidads...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Nacionalidads.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Nacionalidads disponibles
            </div>
          ) : (
            Nacionalidads.map((Nacionalidad) => (
              <SelectItem
                key={Nacionalidad.id}
                value={Nacionalidad.id.toString()}
              >
                {Nacionalidad.nombre}
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
