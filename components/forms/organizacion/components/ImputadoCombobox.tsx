'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Imputado } from '@/types/organizacion';

interface ImputadoComboboxProps {
  value: string;
  onChange: (value: string) => void;
  imputados: Imputado[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  error?: string;
  isDisabled?: boolean;
}

export default function ImputadoCombobox({
  value,
  onChange,
  imputados = [],
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  error,
  isDisabled = false
}: ImputadoComboboxProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Usar el estado controlado externamente si se proporciona, de lo contrario usar el interno
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange || setInternalOpen;

  // Encontrar el imputado seleccionado
  const selectedImputado = imputados.find(
    (imp) => imp.id.toString() === value
  );

  // Filtrar imputados basado en la búsqueda
  const filteredImputados = useMemo(() => {
    if (!Array.isArray(imputados)) return [];
    if (!searchQuery) return imputados;

    const query = searchQuery.toLowerCase();
    return imputados.filter(
      (imp) =>
        imp.nombreSujeto.toLowerCase().includes(query) ||
        (imp.docId && imp.docId.toLowerCase().includes(query))
    );
  }, [imputados, searchQuery]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between pr-8', error && 'border-red-500')}
            disabled={isLoading || isDisabled}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </span>
            ) : selectedImputado ? (
              <div className="flex flex-col items-start gap-1 truncate">
                <span className="truncate">{selectedImputado.nombreSujeto}</span>
                {selectedImputado.docId && (
                  <span className="text-xs text-muted-foreground">
                    {selectedImputado.docId}
                  </span>
                )}
              </div>
            ) : (
              'Seleccione un imputado...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
          <div className="flex flex-col">
            <div className="flex items-center border-b p-2">
              <Input
                placeholder="Buscar por nombre o documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredImputados.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No se encontraron resultados'
                    : 'Comience a escribir para buscar...'}
                </div>
              ) : (
                filteredImputados.map((imp) => (
                  <div
                    key={imp.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-2 p-2 hover:bg-muted',
                      value === imp.id.toString() && 'bg-muted'
                    )}
                    onClick={() => {
                      onChange(imp.id.toString());
                      onOpenChange(false);
                      setSearchQuery(''); // Limpiar búsqueda al seleccionar
                    }}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        value === imp.id.toString()
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{imp.nombreSujeto}</span>
                      {imp.docId && (
                        <span className="text-sm text-muted-foreground">
                          {imp.docId}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Botón de limpiar selección */}
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}