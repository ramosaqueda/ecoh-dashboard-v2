'use client';

import React, { useEffect, useState } from 'react';
import BasicPrimitivesDiagram from '@/components/Genograma/BasicPrimitivesDiagram';
import { Persona, Relacion } from '@/components/Genograma/types';
import { Button } from '@/components/ui/button'; // Assuming we want a print button

export default function GenogramaPrintPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage
    try {
      const storedData = localStorage.getItem('genograma_temp_data');
      if (storedData) {
        const { personas, relaciones } = JSON.parse(storedData);
        if (personas && Array.isArray(personas)) setPersonas(personas);
        if (relaciones && Array.isArray(relaciones)) setRelaciones(relaciones);
      }
    } catch (e) {
      console.error("Failed to load genogram data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (personas.length === 0) return <div>No se encontraron datos de genograma para visualizar.</div>;

  return (
    <div className="w-full h-screen flex flex-col">
       <div className="p-2 bg-slate-100 flex justify-between items-center print:hidden">
          <h1 className="font-bold">Vista de Impresión / Pantalla Completa</h1>
          <Button onClick={() => window.print()}>Imprimir</Button>
       </div>
       <div className="flex-1 w-full h-full">
         <BasicPrimitivesDiagram 
            personas={personas} 
            relaciones={relaciones} 
            className="w-full h-full"
            style={{ height: '100%', width: '100%', border: 'none' }}
         />
       </div>
    </div>
  );
}
