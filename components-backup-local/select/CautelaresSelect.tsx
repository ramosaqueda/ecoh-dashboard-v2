// para implementar en la edicion de plazo

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Cautelar {
    id: number;
    nombre: string;
}

interface CautelarSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function CautelarSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: CautelarSelectProps) {
  const [Cautelares, setCautelares] = useState<Cautelar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar las Cautelares cuando el componente se monta
  useEffect(() => {
    const fetchCautelares = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/cautelar`);
        if (!response.ok) {
          throw new Error('Error al cargar las Cautelares');
        }
        const data = await response.json();
        setCautelares(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Cautelares:', error);
        setFetchError(
          error instanceof Error ? error.message : 'Error al cargar las Cautelares'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCautelares();
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
            <SelectValue placeholder="Selecciona una Cautelar" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Cautelares...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Cautelares.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Delitos disponibles
            </div>
          ) : (
            Cautelares.map((Cautelar) => (
              <SelectItem key={Cautelar.id} value={Cautelar.id.toString()}>
                {Cautelar.nombre}
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
