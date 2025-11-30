"use client";

import React, { useState, useEffect } from 'react';
import FiscalSelect from '@/components/select/FiscalSelect';
import { Loader2, Save, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface Diligencia {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export default function AsignacionDiligenciasPage() {
  const [selectedFiscalId, setSelectedFiscalId] = useState<string | undefined>(undefined);
  const [diligencias, setDiligencias] = useState<Diligencia[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [loadingDiligencias, setLoadingDiligencias] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all available diligencias on mount
  useEffect(() => {
    const fetchDiligencias = async () => {
      try {
        // We can reuse the matrix endpoint or a simple list endpoint. 
        // Assuming /api/diligencias/matrix returns all active diligencias in the 'diligencias' field
        // Or better, check if there is a simple list endpoint. 
        // Let's try /api/diligencias/matrix for now as we know it exists and returns active diligencias.
        const response = await fetch('/api/diligencias/matrix?limit=1'); 
        if (!response.ok) throw new Error('Failed to fetch diligencias');
        const data = await response.json();
        setDiligencias(data.diligencias);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar diligencias');
      } finally {
        setLoadingDiligencias(false);
      }
    };
    fetchDiligencias();
  }, []);

  // Fetch assigned IDs when fiscal changes
  useEffect(() => {
    if (!selectedFiscalId) {
      setAssignedIds([]);
      return;
    }

    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const response = await fetch(`/api/fiscal/${selectedFiscalId}/diligencias`);
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const ids = await response.json();
        setAssignedIds(ids);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar asignaciones');
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [selectedFiscalId]);

  const toggleDiligencia = (id: number) => {
    setAssignedIds(prev => 
      prev.includes(id) 
        ? prev.filter(dId => dId !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedFiscalId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/fiscal/${selectedFiscalId}/diligencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diligenciaIds: assignedIds }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      toast.success('Asignaciones guardadas correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    setAssignedIds(diligencias.map(d => d.id));
  };

  const handleDeselectAll = () => {
    setAssignedIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Asignación de Diligencias</h1>
          <p className="mt-2 text-gray-600">Configure las diligencias mínimas visibles para cada Fiscal.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Fiscal</label>
            <FiscalSelect 
              value={selectedFiscalId}
              onValueChange={setSelectedFiscalId}
            />
          </div>
        </div>

        {selectedFiscalId && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Diligencias Disponibles</h2>
              <div className="space-x-2">
                <button 
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Marcar Todas
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={handleDeselectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Desmarcar Todas
                </button>
              </div>
            </div>

            {loadingDiligencias || loadingAssignments ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diligencias.map(dil => {
                  const isChecked = assignedIds.includes(dil.id);
                  return (
                    <div 
                      key={dil.id}
                      onClick={() => toggleDiligencia(dil.id)}
                      className={`flex items-start p-3 rounded-md border cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${isChecked ? 'text-blue-900' : 'text-gray-900'}`}>
                          {dil.nombre}
                        </p>
                        {dil.descripcion && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {dil.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || loadingAssignments}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
