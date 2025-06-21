import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Atvt {
  id: number;
  nombre: string;
}

interface AtvtSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function AtvtSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: AtvtSelectProps) {
  const [Atvts, setAtvts] = useState<Atvt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar los Atvts cuando el componente se monta
  useEffect(() => {
    const fetchAtvts = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/atvt`);
        if (!response.ok) {
          throw new Error('Error al cargar los Atvts');
        }
        const data = await response.json();
        setAtvts(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Atvts:', error);
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Error al cargar los Atvts'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtvts();
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
            <SelectValue placeholder="Selecciona un Atvt" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Atvts...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Atvts.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Atvt disponibles
            </div>
          ) : (
            Atvts.map((Atvt) => (
              <SelectItem key={Atvt.id} value={Atvt.id.toString()}>
                {Atvt.nombre}
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