'use client';
import { useState } from 'react';
import { Persona, Relacion } from '@/components/Genograma/types';
import { PersonForm } from './PersonForm';
import { RelationForm } from './RelationForm';
import { PersonList } from './PersonList';
import { RelationList } from './RelationList';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GenogramaEditorProps {
  initialPersonas?: Persona[];
  initialRelaciones?: Relacion[];
  onSave: (personas: Persona[], relaciones: Relacion[]) => Promise<void>;
  onDataChange?: (personas: Persona[], relaciones: Relacion[]) => void;
  isSaving?: boolean;
}

export const GenogramaEditor: React.FC<GenogramaEditorProps> = ({ 
    initialPersonas = [], 
    initialRelaciones = [],
    onSave,
    onDataChange,
    isSaving=false
}) => {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [relaciones, setRelaciones] = useState<Relacion[]>(initialRelaciones);

  // Notify parent on changes
  const updateData = (newPersonas: Persona[], newRelaciones: Relacion[]) => {
      setPersonas(newPersonas);
      setRelaciones(newRelaciones);
      if (onDataChange) onDataChange(newPersonas, newRelaciones);
  };

  
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [editingRelacion, setEditingRelacion] = useState<Relacion | null>(null);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('personas');

  // --- CRUD Personas ---
  const handleAddPersona = (p: Persona) => {
    if (personas.some(existing => existing.id === p.id)) {
      alert(`El ID ${p.id} ya existe.`); 
      return;
    }
    updateData([...personas, p], relaciones);
    setShowPersonForm(false);
  };

  const handleUpdatePersona = (p: Persona) => {
    updateData(personas.map(existing => existing.id === p.id ? p : existing), relaciones);
    setEditingPersona(null);
    setShowPersonForm(false);
  };

  const handleDeletePersona = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta persona? Se eliminarán también sus relaciones.')) {
        updateData(
            personas.filter(p => p.id !== id),
            relaciones.filter(r => r.idOrigen !== id && r.idDestino !== id)
        );
    }
  };

  // --- CRUD Relaciones ---
  const handleAddRelacion = (r: Relacion) => {
    // Check duplicates?
    updateData(personas, [...relaciones, r]);
    setShowRelationForm(false);
  };

  const handleUpdateRelacion = (r: Relacion) => {
    if (editingRelacion) {
        const newRelaciones = relaciones.filter(item => item !== editingRelacion);
        updateData(personas, [...newRelaciones, r]);
    }
    setEditingRelacion(null);
    setShowRelationForm(false);
  };

  const handleDeleteRelacion = (r: Relacion) => {
    if (confirm('¿Eliminar relación?')) {
        updateData(personas, relaciones.filter(item => item !== r));
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
         <h2 className="font-semibold text-lg">Editor de Datos</h2>
         <Button onClick={() => onSave(personas, relaciones)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
         </Button>
         <Button variant="outline" onClick={() => {
             localStorage.setItem('genograma_temp_data', JSON.stringify({ personas, relaciones }));
             window.open('/dashboard/genograma/print', '_blank');
         }}>
             Ver en Nueva Ventana
         </Button>
      </div>

      <div className="flex-1 min-h-0">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personas">Personas ({personas.length})</TabsTrigger>
                <TabsTrigger value="relaciones">Relaciones ({relaciones.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="personas" className="flex-1 overflow-auto p-1">
                {!showPersonForm && !editingPersona && (
                    <div className="mb-4">
                        <Button onClick={() => setShowPersonForm(true)} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Agregar Persona
                        </Button>
                    </div>
                )}

                {(showPersonForm || editingPersona) ? (
                    <PersonForm 
                        initialData={editingPersona} 
                        onSubmit={editingPersona ? handleUpdatePersona : handleAddPersona}
                        onCancel={() => { setShowPersonForm(false); setEditingPersona(null); }}
                    />
                ) : (
                    <PersonList 
                        personas={personas} 
                        onEdit={(p) => { setEditingPersona(p); setShowPersonForm(true); }}
                        onDelete={handleDeletePersona}
                    />
                )}
            </TabsContent>

            <TabsContent value="relaciones" className="flex-1 overflow-auto p-1">
                 {!showRelationForm && !editingRelacion && (
                    <div className="mb-4">
                        <Button onClick={() => setShowRelationForm(true)} className="w-full" disabled={personas.length < 2}>
                            <Plus className="w-4 h-4 mr-2" /> Agregar Relación
                        </Button>
                    </div>
                )}

                {(showRelationForm || editingRelacion) ? (
                    <RelationForm 
                        initialData={editingRelacion}
                        personas={personas}
                        onSubmit={editingRelacion ? handleUpdateRelacion : handleAddRelacion}
                        onCancel={() => { setShowRelationForm(false); setEditingRelacion(null); }}
                    />
                ) : (
                    <RelationList 
                        relaciones={relaciones}
                        personas={personas}
                        onEdit={(r) => { setEditingRelacion(r); setShowRelationForm(true); }}
                        onDelete={handleDeleteRelacion}
                    />
                )}
            </TabsContent>
         </Tabs>
      </div>

      {/* Expose data for parent diagram */}
      {/* This component is UI only, state is internal but we need to pass it up or parent needs to control it.
          For this implementation, let's lift state or use a callback to notify parent of changes if we want real-time update in diagrams.
          But user asked for specific page. Let's assume we want to render diagram SIDE BY SIDE.
       */}
    </div>
  );
};
