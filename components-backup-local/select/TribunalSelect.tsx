import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Tribunal {
  id: number;
  nombre: string;
}

interface TribunalSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function TribunalSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: TribunalSelectProps) {
  const [Tribunals, setTribunals] = useState<Tribunal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar los Tribunals cuando el componente se monta
  useEffect(() => {
    const fetchTribunals = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tribunal`);
        if (!response.ok) {
          throw new Error('Error al cargar los Tribunals');
        }
        const data = await response.json();
        setTribunals(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Tribunals:', error);
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Error al cargar los Tribunals'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTribunals();
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
            <SelectValue placeholder="Selecciona un Tribunal" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Tribunals...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Tribunals.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Tribunals disponibles
            </div>
          ) : (
            Tribunals.map((Tribunal) => (
              <SelectItem key={Tribunal.id} value={Tribunal.id.toString()}>
                {Tribunal.nombre}
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
