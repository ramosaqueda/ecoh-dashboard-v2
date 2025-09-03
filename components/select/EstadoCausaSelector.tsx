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

  // 🔍 DEBUG: Log cuando cambian los props
  useEffect(() => {
    console.log('🔍 EstadoCausaSelector - Props changed:', {
      value,
      estadosLoaded: estados.length,
      isLoading,
      valueExists: estados.some(e => e.id.toString() === value)
    });
  }, [value, estados.length, isLoading]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/estados-causa');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🔍 DEBUG EstadoCausaSelector - Datos cargados:', data);
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
    ? estados.find(e => e.id.toString() === value) 
    : null;

  // 🔍 DEBUG: Log cuando el valor o las opciones cambien
  useEffect(() => {
    console.log('🔍 DEBUG EstadoCausaSelector - Estado actual:', {
      value,
      isLoading,
      estadosCount: estados.length,
      selectedEstado: selectedEstado ? { id: selectedEstado.id, nombre: selectedEstado.nombre } : null,
      estados: estados.map(e => ({ id: e.id, nombre: e.nombre }))
    });
  }, [value, estados, isLoading, selectedEstado]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        key={`estado-${value}-${estados.length}`} // ✅ Forzar re-render cuando cambie valor o datos
        disabled={disabled || isLoading}
        onValueChange={(value) => {
          console.log('🔍 DEBUG EstadoCausaSelector - Valor seleccionado:', value);
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
              .sort((a, b) => (a.orden || 999) - (b.orden || 999))
              .map((estado) => (
                <SelectItem key={estado.id} value={estado.id.toString()}>
                  <div className="flex items-center gap-2">
                    {/* Indicador de color si está disponible */}
                    {estado.color && (
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: estado.color }}
                      />
                    )}
                    <span>{estado.nombre}</span>
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      {/* Mostrar información del estado seleccionado */}
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
          Error al cargar estados: {fetchError}
        </div>
      )}

      {/* Información de ayuda */}
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
    'TRAMITACION': '#3b82f6',      // Azul
    'INV_CERRADA': '#f59e0b',      // Ámbar
    'CERRADA_SENTENCIA': '#10b981' // Verde
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
