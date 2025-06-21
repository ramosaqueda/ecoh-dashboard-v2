'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface GenogramaSearchProps {
  onLoadGenograma: (ruc: string) => void;
  isLoading: boolean;
}

export function GenogramaSearch({ onLoadGenograma, isLoading }: GenogramaSearchProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchRuc, setSearchRuc] = useState('');
  const [recentGenogramas, setRecentGenogramas] = useState<{ ruc: string; fecha: string }[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  const handleSearch = () => {
    if (searchRuc.trim()) {
      onLoadGenograma(searchRuc.trim());
      setDialogOpen(false);
    }
  };

  const loadRecentGenogramas = async () => {
    setIsLoadingRecent(true);
    try {
      const response = await fetch('/api/genograma/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentGenogramas(data.genogramas || []);
      }
    } catch (error) {
      console.error('Error al cargar genogramas recientes:', error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Cargar genogramas recientes al abrir el diálogo
  const handleOpenDialog = () => {
    setDialogOpen(true);
    loadRecentGenogramas();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={handleOpenDialog}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Abrir Genograma
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar Genograma</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-end gap-2 my-4">
          <div className="flex-1">
            <Label htmlFor="rucSearch">RUC de la Causa</Label>
            <Input
              id="rucSearch"
              placeholder="Ingrese RUC para buscar"
              value={searchRuc}
              onChange={(e) => setSearchRuc(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!searchRuc.trim() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Buscar
          </Button>
        </div>

        {/* Genogramas recientes */}
        <div className="border rounded-md p-3 mt-4">
          <h3 className="text-sm font-medium mb-2">Genogramas Recientes</h3>
          
          {isLoadingRecent ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : recentGenogramas.length > 0 ? (
            <ul className="space-y-1">
              {recentGenogramas.map((item) => (
                <li key={item.ruc} className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-100">
                  <div>
                    <span className="font-medium">{item.ruc}</span>
                    <span className="text-xs text-gray-500 ml-2">{item.fecha}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onLoadGenograma(item.ruc);
                      setDialogOpen(false);
                    }}
                  >
                    Abrir
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No se encontraron genogramas recientes</p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}