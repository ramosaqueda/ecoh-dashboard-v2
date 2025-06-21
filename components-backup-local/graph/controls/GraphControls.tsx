// components/graph/controls/GraphControls.tsx
'use client';

import { Search, Sliders } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useState, useCallback, useRef } from 'react';

// Función debounce personalizada
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Interfaces de tipos
interface TipoOrganizacion {
  id: number;
  nombre: string;
}

interface GraphControlsProps {
  onSearch: (value: string) => void;
  tipoOrganizacion: string;
  onTipoChange: (value: string) => void;
  showActiveOnly: boolean;
  onActiveChange: (value: boolean) => void;
  tipos: TipoOrganizacion[];
  className?: string;
  linkDistance: number;
  onLinkDistanceChange: (value: number) => void;
  nodeSize: number;
  onNodeSizeChange: (value: number) => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onSearch,
  tipoOrganizacion,
  onTipoChange,
  showActiveOnly,
  onActiveChange,
  tipos,
  className,
  linkDistance,
  onLinkDistanceChange,
  nodeSize,
  onNodeSizeChange,
  svgRef
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClearSearch = (): void => {
    setSearchValue('');
    onSearch('');
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleTipoChange = (value: string): void => {
    onTipoChange(value);
  };

  // Configurar cambios visuales con debounce para mejor rendimiento
  const debouncedLinkDistanceChange = useCallback(
    debounce((value: number) => {
      onLinkDistanceChange(value);
    }, 300),
    [onLinkDistanceChange]
  );

  const debouncedNodeSizeChange = useCallback(
    debounce((value: number) => {
      onNodeSizeChange(value);
    }, 300),
    [onNodeSizeChange]
  );

  const handleSliderChange = (values: number[], onChange: (value: number) => void): void => {
    const [value] = values;
    onChange(value);
  };

  return (
    <Card className={`p-4 ${className || ''}`}>
      <div className="flex flex-wrap items-center gap-4">
        <form 
          ref={formRef}
          onSubmit={handleSearchSubmit} 
          className="flex-1 min-w-[200px] lg:max-w-sm flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar organización o imputado..."
              className="pl-8"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
          {searchValue && (
            <Button 
              type="button" 
              variant="ghost"
              onClick={handleClearSearch}
            >
              Limpiar
            </Button>
          )}
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <Select 
            value={tipoOrganizacion} 
            onValueChange={handleTipoChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de organización" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <Switch
              id="active-filter"
              checked={showActiveOnly}
              onCheckedChange={onActiveChange}
            />
            <Label htmlFor="active-filter">Solo activos</Label>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Sliders className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Distancia entre nodos</Label>
                    <span className="text-sm text-muted-foreground">
                      {linkDistance}px
                    </span>
                  </div>
                  <Slider
                    value={[linkDistance]}
                    onValueChange={(values) => handleSliderChange(values, debouncedLinkDistanceChange)}
                    min={100}
                    max={400}
                    step={50}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    Ajusta el espacio entre organizaciones e imputados
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tamaño de nodos</Label>
                    <span className="text-sm text-muted-foreground">
                      {nodeSize}
                    </span>
                  </div>
                  <Slider
                    value={[nodeSize]}
                    onValueChange={(values) => handleSliderChange(values, debouncedNodeSizeChange)}
                    min={10}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    Organizaciones (cubos) y Personas (esferas)
                  </span>
                </div>

                <div className="pt-2 text-xs text-muted-foreground">
                  <p>• Organizaciones representadas como cubos</p>
                  <p>• Personas representadas como esferas</p>
                  <p>• Colores únicos para cada grupo de relación</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};