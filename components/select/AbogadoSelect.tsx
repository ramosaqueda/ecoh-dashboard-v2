import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Abogado {
  id: number;
  nombre: string;
}

interface AbogadoSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function AbogadoSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: AbogadoSelectProps) {
  const [abogados, setAbogados] = useState<Abogado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar los abogados cuando el componente se monta
  useEffect(() => {
    const fetchAbogados = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/abogado`);
        if (!response.ok) {
          throw new Error('Error al cargar los abogados');
        }
        const data = await response.json();
        setAbogados(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching abogados:', error);
        setFetchError(
          error instanceof Error
            ? error.message
            : 'Error al cargar los abogados'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbogados();
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
            <SelectValue placeholder="Selecciona un abogado" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando abogados...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : abogados.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay abogados disponibles
            </div>
          ) : (
            abogados.map((abogado) => (
              <SelectItem key={abogado.id} value={abogado.id.toString()}>
                {abogado.nombre}
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
