"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Diligencia {
  id: number;
  nombre: string;
  descripcion: string | null;
  causaDiligencia: {
    realizada: boolean;
    fechaRealizacion: string | null;
    fechaReiteracion: string | null;
    observacion: string | null;
  } | null;
}

interface DiligenciaListProps {
  causaId: number;
}

export const DiligenciaList: React.FC<DiligenciaListProps> = ({ causaId }) => {
  const [diligencias, setDiligencias] = useState<Diligencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDiligencias();
  }, [causaId]);

  const fetchDiligencias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/diligencias/${causaId}`);
      if (!response.ok) throw new Error('Failed to fetch diligencias');
      const data = await response.json();
      setDiligencias(data);
    } catch (err) {
      setError('Error al cargar las diligencias');
      console.error(err);
      toast.error('Error al cargar las diligencias');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (diligenciaId: number, data: any) => {
    setUpdatingId(diligenciaId);
    try {
      const response = await fetch(`/api/diligencias/${causaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diligenciaId,
          ...data,
        }),
      });

      if (!response.ok) throw new Error('Failed to update diligencia');

      // Optimistic update or refresh
      await fetchDiligencias();
      toast.success('Diligencia actualizada');
    } catch (err) {
      console.error('Error updating diligencia:', err);
      toast.error('Error al actualizar la diligencia');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
      <AlertCircle className="h-5 w-5" />
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-blue-600" />
          Diligencias Mínimas
        </h2>
        <span className="text-sm text-gray-500">
          {diligencias.filter(d => d.causaDiligencia?.realizada).length} / {diligencias.length} completadas
        </span>
      </div>

      <div className="grid gap-4">
        {diligencias.map((diligencia) => {
          const isRealizada = diligencia.causaDiligencia?.realizada || false;
          const isUpdating = updatingId === diligencia.id;

          return (
            <div
              key={diligencia.id}
              className={`border rounded-lg shadow-sm transition-all duration-200 ${isRealizada ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleUpdate(diligencia.id, {
                      realizada: !isRealizada,
                      fechaRealizacion: !isRealizada && !diligencia.causaDiligencia?.fechaRealizacion
                        ? new Date().toISOString()
                        : diligencia.causaDiligencia?.fechaRealizacion
                    })}
                    disabled={isUpdating}
                    className={`mt-1 flex-shrink-0 rounded-full p-1 transition-colors ${isRealizada
                        ? 'text-blue-600 hover:bg-blue-100'
                        : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                      }`}
                  >
                    {isRealizada ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium ${isRealizada ? 'text-blue-900' : 'text-gray-900'}`}>
                          {diligencia.nombre}
                        </h3>
                        {diligencia.descripcion && (
                          <p className="text-sm text-gray-500 mt-0.5">{diligencia.descripcion}</p>
                        )}
                      </div>
                      {isUpdating && (
                        <span className="text-xs text-blue-500 animate-pulse">Guardando...</span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Fecha Realización
                        </label>
                        <input
                          type="date"
                          value={diligencia.causaDiligencia?.fechaRealizacion ? format(new Date(diligencia.causaDiligencia.fechaRealizacion), 'yyyy-MM-dd') : ''}
                          onChange={(e) => handleUpdate(diligencia.id, {
                            realizada: true,
                            fechaRealizacion: e.target.value
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Fecha Reiteración / Pide Cuenta
                        </label>
                        <input
                          type="date"
                          value={diligencia.causaDiligencia?.fechaReiteracion ? format(new Date(diligencia.causaDiligencia.fechaReiteracion), 'yyyy-MM-dd') : ''}
                          onChange={(e) => handleUpdate(diligencia.id, { fechaReiteracion: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Observación
                        </label>
                        <textarea
                          value={diligencia.causaDiligencia?.observacion || ''}
                          onChange={(e) => {
                            // Local state update could be handled here if we extracted the item state
                          }}
                          onBlur={(e) => handleUpdate(diligencia.id, { observacion: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          rows={2}
                          placeholder="Agregar observación..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
