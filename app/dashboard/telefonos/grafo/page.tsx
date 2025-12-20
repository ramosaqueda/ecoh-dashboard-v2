'use client';

import React, { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import TelefonoNetworkGraph from '@/components/graph/TelefonoNetworkGraph';
import { TelefonoCausasDrawer } from '@/components/drawer/telefono-causas-drawer';
import { CausaTelefonosDrawer } from '@/components/drawer/causa-telefonos-drawer';
import { Telefono } from '@/components/tables/telefono-tables/columns';
import { toast } from 'sonner';

export default function TelefonoGrafoPage() {
  const [selectedTelefono, setSelectedTelefono] = useState<Telefono | null>(null);
  const [selectedCausa, setSelectedCausa] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCausaDrawerOpen, setIsCausaDrawerOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleNodeClick = async (node: any) => {
    setLoadingDetails(true);
    try {
      if (node.group === 'telefono') {
        const telefonoId = node.id.replace('T-', '');
        const response = await fetch(`/api/telefonos/${telefonoId}`);
        if (!response.ok) throw new Error('Error al cargar detalles del teléfono');
        
        const data = await response.json();
        setSelectedTelefono(data);
        setIsDrawerOpen(true);
      } else if (node.group === 'causa') {
        const causaId = node.id.replace('C-', '');
        const response = await fetch(`/api/causas/${causaId}`);
        if (!response.ok) throw new Error('Error al cargar detalles de la causa');
        
        const data = await response.json();
        setSelectedCausa(data);
        setIsCausaDrawerOpen(true);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Error al cargar los detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 p-6 h-[calc(100vh-4rem)] flex flex-col relative">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Share2 className="h-8 w-8 text-blue-600" />
            Grafo de Interconexión
          </h1>
          <p className="text-muted-foreground">
            Visualización de relaciones entre Causas y Teléfonos
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {loadingDetails && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <TelefonoNetworkGraph onNodeClick={handleNodeClick} />
      </div>

      {selectedTelefono && (
        <TelefonoCausasDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          telefono={selectedTelefono}
        />
      )}

      {selectedCausa && (
        <CausaTelefonosDrawer
          isOpen={isCausaDrawerOpen}
          onClose={() => setIsCausaDrawerOpen(false)}
          causa={selectedCausa}
        />
      )}
    </div>
  );
}