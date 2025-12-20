'use client';

import React from 'react';
import BasicPrimitivesDiagram from './BasicPrimitivesDiagram';
import { Persona, Relacion } from './types';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';

interface GenogramaViewerProps {
  personas: Persona[];
  relaciones: Relacion[];
}

export const GenogramaViewer: React.FC<GenogramaViewerProps> = ({ personas, relaciones }) => {

  const handleOpenInNewWindow = () => {
     // Save data to localStorage
     localStorage.setItem('genograma_temp_data', JSON.stringify({ personas, relaciones }));
     
     // Open new window
     window.open('/dashboard/genograma/print', '_blank');
  };

  if (!personas || personas.length === 0) {
    return (
        <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
            <div className="text-slate-500 italic">No hay datos para visualizar. Agregue personas y relaciones.</div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
          <Button 
            onClick={handleOpenInNewWindow} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Ver en pantalla completa / Imprimir
          </Button>
      </div>
      <div className="border rounded-md p-4 min-h-[500px]">
        <BasicPrimitivesDiagram personas={personas} relaciones={relaciones} />
      </div>
    </div>
  );
};