import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface EstadoCausa {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

interface EstadoCausaSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const EstadoCausaSelect: React.FC<EstadoCausaSelectProps> = ({
  value,
  onValueChange,
  error,
  placeholder = "Seleccionar estado...",
  disabled = false
}) => {
  const [estados, setEstados] = useState<EstadoCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/estado-causa?activo=true');
        
        if (!response.ok) {
          throw new Error('Error al cargar estados de causa');
        }
        
        const data = await response.json();
        setEstados(data);
        setLoadError(null);
      } catch (error) {
        console.error('Error fetching estados:', error);
        setLoadError('Error al cargar estados');
        setEstados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstados();
  }, []);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando estados...
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  if (loadError) {
    return (
      <Select disabled>
        <SelectTrigger className="border-red-500">
          <SelectValue placeholder={loadError} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {estados.map((estado) => (
          <SelectItem key={estado.id} value={estado.id.toString()}>
            <div className="flex flex-col">
              <span>{estado.nombre}</span>
              {estado.descripcion && (
                <span className="text-xs text-muted-foreground">
                  {estado.descripcion}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EstadoCausaSelect;