'use client';

import { useState, useCallback } from 'react';
import BasicPrimitivesDiagram from '@/components/Genograma/BasicPrimitivesDiagram';
import { GenogramaEditor } from '@/components/Genograma/Editor/GenogramaEditor';
import { Persona, Relacion } from '@/components/Genograma/types';
import { toast } from 'sonner';

export default function GenogramaEditorPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // In a real app, we would load initial data from API here using useEffect

  const handleSave = async (updatedPersonas: Persona[], updatedRelaciones: Relacion[]) => {
    setIsSaving(true);
    try {
      // Mock API call
      // await axios.post('/api/genograma', { personas: updatedPersonas, relaciones: updatedRelaciones });
      
      // We simulate success
      console.log('Saving genogram:', updatedPersonas, updatedRelaciones);
      toast.success('Genograma guardado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataChange = useCallback((p: Persona[], r: Relacion[]) => {
    setPersonas(p);
    setRelaciones(r);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col md:flex-row gap-4">
      {/* Left Panel: Editor */}
      <div className="w-full md:w-1/3 bg-white border rounded shadow-sm overflow-hidden flex flex-col h-full">
        <GenogramaEditor 
            initialPersonas={personas} 
            initialRelaciones={relaciones}
            onSave={handleSave}
            onDataChange={handleDataChange}
            isSaving={isSaving}
        />
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full md:w-2/3 bg-white border rounded shadow-sm flex flex-col h-full">
        <div className="p-2 border-b bg-slate-50 font-medium text-slate-700">Visualización en Vivo</div>
        <div className="flex-1 overflow-auto bg-slate-50 relative">
            <BasicPrimitivesDiagram 
                personas={personas} 
                relaciones={relaciones} 
                style={{ width: '100%', height: '100%', border: 'none' }}
            />
            {personas.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Agregue personas para visualizar el genograma
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
