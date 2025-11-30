import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface UsuarioSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export default function UsuarioSelect({
  value,
  onValueChange,
  className = 'w-full',
  error,
  disabled = false
}: UsuarioSelectProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios`);
        if (!response.ok) {
          throw new Error('Error al cargar los usuarios');
        }
        const data = await response.json();
        setUsuarios(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching usuarios:', error);
        setFetchError(
          error instanceof Error ? error.message : 'Error al cargar los usuarios'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
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
            <SelectValue placeholder="Selecciona un Usuario" />
          )}
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Cargando Usuarios...</span>
            </div>
          ) : fetchError ? (
            <div className="p-2 text-sm text-red-500">{fetchError}</div>
          ) : usuarios.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay usuarios disponibles
            </div>
          ) : (
            usuarios.map((usuario) => (
              <SelectItem key={usuario.id} value={usuario.id.toString()}>
                {usuario.nombre}
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
