import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Analista {
  id: number;
  nombre: string;
}

interface AnalistaSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function AnalistaSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: AnalistaSelectProps) {
  const [Analistas, setAnalistas] = useState<Analista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar los Analistas cuando el componente se monta
  useEffect(() => {
    const fetchAnalistas = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/analista`);
        if (!response.ok) {
          throw new Error('Error al cargar los Analistas');
        }
        const data = await response.json();
        setAnalistas(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Analistas:', error);
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Error al cargar los Analistas'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalistas();
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
            <SelectValue placeholder="Selecciona un Analista" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Analistas...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Analistas.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Analistas disponibles
            </div>
          ) : (
            Analistas.map((Analista) => (
              <SelectItem key={Analista.id} value={Analista.id.toString()}>
                {Analista.nombre}
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
