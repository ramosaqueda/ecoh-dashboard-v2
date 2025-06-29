import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface OrigenCausa {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface OrigenCausaSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const OrigenCausaSelect: React.FC<OrigenCausaSelectProps> = ({
  value,
  onValueChange,
  error,
  placeholder = "Seleccionar origen...",
  disabled = false
}) => {
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigenes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/origen-causa?activo=true');
        
        if (!response.ok) {
          throw new Error('Error al cargar orígenes de causa');
        }
        
        const data = await response.json();
        setOrigenes(data);
        setLoadError(null);
      } catch (error) {
        console.error('Error fetching orígenes:', error);
        setLoadError('Error al cargar orígenes');
        setOrigenes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrigenes();
  }, []);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando orígenes...
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
        {origenes.map((origen) => (
          <SelectItem key={origen.id} value={origen.id.toString()}>
            {origen.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default OrigenCausaSelect;