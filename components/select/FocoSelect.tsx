import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Foco {
  id: number;
  nombre: string;
}

interface FocoSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function FocoSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: FocoSelectProps) {
  const [Focos, setFocos] = useState<Foco[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Cargar los Focos cuando el componente se monta
  useEffect(() => {
    const fetchFocos = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/foco`);
        if (!response.ok) {
          throw new Error('Error al cargar los Focos');
        }
        const data = await response.json();
        setFocos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching Focos:', error);
        setFetchError(
          error instanceof Error ? error.message : 'Error al cargar los Focos'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFocos();
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
            <SelectValue placeholder="Selecciona un Foco" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Focos...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : Focos.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay Focos disponibles
            </div>
          ) : (
            Focos.map((Foco) => (
              <SelectItem key={Foco.id} value={Foco.id.toString()}>
                {Foco.nombre}
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
