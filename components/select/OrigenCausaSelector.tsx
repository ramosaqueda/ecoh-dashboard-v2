'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { OrigenCausa } from '@/types/causa';

interface OrigenCausaSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  includeEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}

export default function OrigenCausaSelector({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Seleccione origen de causa",
  includeEmpty = false,
  emptyLabel = "Sin origen específico",
  className = ""
}: OrigenCausaSelectorProps) {
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigenes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/origenes-causa');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setOrigenes(data || []);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching origenes de causa:', error);
        setFetchError(error instanceof Error ? error.message : 'Error desconocido');
        setOrigenes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrigenes();
  }, []);

  // Encontrar el origen seleccionado para mostrar información adicional
  const selectedOrigen = (value && value !== "" && value !== "__empty__") 
    ? origenes.find(o => o.id.toString() === value) 
    : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        disabled={disabled || isLoading}
        onValueChange={(value) => {
          // Manejar el valor especial "__empty__" como string vacío
          const actualValue = value === "__empty__" ? "" : value;
          onChange(actualValue);
        }}
        value={value === "" ? "__empty__" : (value || "")}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={isLoading ? "Cargando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Opción vacía si se permite */}
          {includeEmpty && (
            <SelectItem value="__empty__">
              <span className="text-muted-foreground italic">{emptyLabel}</span>
            </SelectItem>
          )}
          
          {isLoading ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando orígenes...
            </div>
          ) : fetchError ? (
            <div className="flex items-center gap-2 p-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              Error al cargar opciones
            </div>
          ) : origenes.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No hay orígenes de causa disponibles
            </div>
          ) : (
            origenes.map((origen) => (
              <SelectItem key={origen.id} value={origen.id.toString()}>
                <div className="flex items-center gap-2">
                  {/* Indicador de color si está disponible */}
                  {origen.color && (
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: origen.color }}
                    />
                  )}
                  <span className="font-medium">{origen.codigo}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{origen.nombre}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Mostrar información del origen seleccionado */}
      {selectedOrigen && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              borderColor: selectedOrigen.color || '#e5e7eb',
              color: selectedOrigen.color || '#6b7280'
            }}
          >
            {selectedOrigen.codigo}
          </Badge>
          {selectedOrigen.descripcion && (
            <span className="text-xs text-muted-foreground">
              {selectedOrigen.descripcion}
            </span>
          )}
        </div>
      )}

      {/* Mostrar error si existe */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Mostrar error de carga si existe */}
      {fetchError && (
        <div className="text-xs text-red-500">
          Error al cargar orígenes: {fetchError}
        </div>
      )}

      {/* Información de ayuda */}
      {!isLoading && !fetchError && origenes.length > 0 && (
        <div className="text-xs text-muted-foreground">
          💡 Los orígenes determinan la procedencia de la causa
        </div>
      )}
    </div>
  );
}

// Hook personalizado para usar en formularios
export function useOrigenCausaOptions() {
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigenes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/origenes-causa');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setOrigenes(data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching origenes de causa:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        setOrigenes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrigenes();
  }, []);

  return { origenes, isLoading, error };
}

// Utilidad para obtener el color de un origen por código
export function getOrigenColor(codigo: string): string {
  const colorMap: Record<string, string> = {
    'ECOH': '#ef4444',
    'SACFI': '#3b82f6', 
    'LEGADA': '#f59e0b'
  };
  
  return colorMap[codigo] || '#6b7280';
}

// Utilidad para obtener información de un origen por ID
export function useOrigenById(id: number | string | null) {
  const { origenes, isLoading } = useOrigenCausaOptions();
  
  const origen = (id && id !== "" && id !== "__empty__") 
    ? origenes.find(o => o.id.toString() === id.toString()) 
    : null;
  
  return { origen, isLoading };
}
