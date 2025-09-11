'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';

interface EstadoCausa {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  activo: boolean;
  orden: number | null;
  color: string | null;
}

interface EstadoCausaSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  includeEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}

export default function EstadoCausaSelector({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Seleccione estado de causa",
  includeEmpty = false,
  emptyLabel = "Sin estado específico",
  className = ""
}: EstadoCausaSelectorProps) {
  const [estados, setEstados] = useState<EstadoCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/estados-causa');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setEstados(data || []);
        setFetchError(null);
      } catch (error) {
        console.error('Error fetching estados de causa:', error);
        setFetchError(error instanceof Error ? error.message : 'Error desconocido');
        setEstados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstados();
  }, []);

  // Encontrar el estado seleccionado para mostrar información adicional
  const selectedEstado = (value && value !== "" && value !== "__empty__") 
    ? estados.find(e => e.id.toString() === value.toString()) 
    : null;

  // Determinar el valor efectivo para el Select
  const effectiveValue = (() => {
    if (!value || value === "") {
      return includeEmpty ? "__empty__" : "";
    }

    if (isLoading) {
      return value;
    }

    const valueAsString = value.toString();
    const exists = estados.some(e => e.id.toString() === valueAsString);
    
    if (exists) {
      return valueAsString;
    }

    return includeEmpty ? "__empty__" : valueAsString;
  })();

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        key={`estado-${value}-${estados.length}-${isLoading}`}
        disabled={disabled || isLoading}
        onValueChange={(newValue) => {
          const actualValue = newValue === "__empty__" ? "" : newValue;
          onChange(actualValue);
        }}
        value={effectiveValue}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={isLoading ? "Cargando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeEmpty && (
            <SelectItem value="__empty__">
              <span className="text-muted-foreground italic">{emptyLabel}</span>
            </SelectItem>
          )}
          
          {isLoading ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando estados...
            </div>
          ) : fetchError ? (
            <div className="flex items-center gap-2 p-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              Error al cargar opciones
            </div>
          ) : estados.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No hay estados de causa disponibles
            </div>
          ) : (
            estados
              .filter(estado => estado.activo)
              .sort((a, b) => (a.orden || 999) - (b.orden || 999))
              .map((estado) => (
                <SelectItem key={estado.id} value={estado.id.toString()}>
                  <div className="flex items-center gap-2">
                    {estado.color && (
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: estado.color }}
                      />
                    )}
                    <span className="font-medium">{estado.nombre}</span>
                    {estado.descripcion && (
                      <>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground truncate">
                          {estado.descripcion}
                        </span>
                      </>
                    )}
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      {selectedEstado && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={{ 
              borderColor: selectedEstado.color || '#e5e7eb',
              color: selectedEstado.color || '#6b7280'
            }}
          >
            {selectedEstado.codigo}
          </Badge>
          {selectedEstado.descripcion && (
            <span className="text-xs text-muted-foreground">
              {selectedEstado.descripcion}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {fetchError && (
        <div className="text-xs text-red-500">
          Error al cargar estados: {fetchError}
        </div>
      )}

      {!isLoading && !fetchError && estados.length > 0 && (
        <div className="text-xs text-muted-foreground">
          💡 Los estados indican la fase procesal actual de la causa
        </div>
      )}
    </div>
  );
}

// Hook personalizado para usar en formularios
export function useEstadoCausaOptions() {
  const [estados, setEstados] = useState<EstadoCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/estados-causa');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setEstados(data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching estados de causa:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        setEstados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstados();
  }, []);

  return { estados, isLoading, error };
}

// Utilidad para obtener el color de un estado por código
export function getEstadoColor(codigo: string): string {
  const colorMap: Record<string, string> = {
    'INICIO_INV': '#3b82f6',         // Azul
    'INV_CERRADA': '#f59e0b',        // Ámbar
    'CERR_SENTENCIA': '#10b981',     // Verde
    'CERR_OTRAS': '#6b7280'          // Gris
  };
  
  return colorMap[codigo] || '#6b7280';
}

// Utilidad para obtener información de un estado por ID
export function useEstadoById(id: number | string | null) {
  const { estados, isLoading } = useEstadoCausaOptions();
  
  const estado = (id && id !== "" && id !== "__empty__") 
    ? estados.find(e => e.id.toString() === id.toString()) 
    : null;
  
  return { estado, isLoading };
}