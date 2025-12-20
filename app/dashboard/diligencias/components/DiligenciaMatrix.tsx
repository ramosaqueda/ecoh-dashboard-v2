"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, Minus, AlertCircle, Loader2, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import FiscalSelect from '@/components/select/FiscalSelect';
import CausaSelector from '@/components/select/CausaSelector';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// @ts-expect-error: pdfMake vfs assignment workaround
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

interface Diligencia {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface CausaDiligencia {
  diligenciaId: number;
  realizada: boolean;
  noNecesaria: boolean;
  fechaRealizacion: string | null;
  fechaReiteracion: string | null;
  observacion: string | null;
}

interface Causa {
  id: number;
  ruc: string | null;
  denominacionCausa: string;
  diligencias: CausaDiligencia[];
}

interface MatrixData {
  diligencias: Diligencia[];
  causas: Causa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const DiligenciaMatrix: React.FC = () => {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCell, setUpdatingCell] = useState<{c: number, d: number} | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [selectedFiscalId, setSelectedFiscalId] = useState<string | undefined>(undefined);
  const [selectedCausaId, setSelectedCausaId] = useState<string>('');

  useEffect(() => {
    fetchMatrix();
  }, [selectedFiscalId, selectedCausaId]);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ limit: '50' });
      if (selectedFiscalId) {
        queryParams.append('fiscalId', selectedFiscalId);
      }
      if (selectedCausaId) {
        queryParams.append('causaId', selectedCausaId);
      }
      
      const response = await fetch(`/api/diligencias/matrix?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch matrix data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Error al cargar la matriz de diligencias');
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedFiscalId(undefined);
    setSelectedCausaId('');
  };

  const generatePdf = () => {
    if (!data) return;

    const docDefinition: any = {
      pageOrientation: 'landscape',
      pageSize: 'LEGAL',
      pageMargins: [20, 30, 20, 30],
      content: [
        { text: 'Matriz de Diligencias Mínimas', style: 'header' },
        { text: `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['auto', ...data.diligencias.map(() => '*')],
            body: [
              [
                { text: 'Causa (RUC)', style: 'tableHeader' },
                ...data.diligencias.map(d => ({
                  text: d.nombre,
                  style: 'tableHeader',
                  alignment: 'center'
                }))
              ],
              ...data.causas.map(causa => {
                return [
                  { 
                    text: `${causa.ruc || 'S/RUC'}\n${causa.denominacionCausa}`, 
                    style: 'cellCausa',
                    margin: [2, 4, 2, 4]
                  },
                  ...data.diligencias.map(dil => {
                    const cellData = causa.diligencias.find(d => d.diligenciaId === dil.id);
                    let symbol = '';
                    let fillColor = '#ffffff';

                    if (cellData?.realizada) {
                      symbol = '✓';
                      fillColor = '#22c55e';
                    } else if (cellData?.noNecesaria) {
                      symbol = '—';
                      fillColor = '#9ca3af';
                    }

                    return { 
                      text: symbol, 
                      style: 'cellStatus', 
                      fillColor, 
                      alignment: 'center',
                      color: symbol ? '#ffffff' : '#000000'
                    };
                  })
                ];
              })
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          }
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 5],
          color: '#1f2937'
        },
        subheader: {
          fontSize: 9,
          color: '#6b7280',
          margin: [0, 0, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 7,
          color: '#374151',
          fillColor: '#f3f4f6',
          margin: [2, 4, 2, 4]
        },
        cellCausa: {
          fontSize: 7,
          color: '#374151'
        },
        cellStatus: {
          fontSize: 10,
          bold: true
        }
      }
    };

    pdfMake.createPdf(docDefinition).download(`matriz_diligencias_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('PDF generado correctamente');
  };

  const handleUpdate = async (causaId: number, diligenciaId: number, updates: Partial<CausaDiligencia>) => {
    setUpdatingCell({ c: causaId, d: diligenciaId });
    try {
      const response = await fetch(`/api/diligencias/${causaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diligenciaId,
          ...updates,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          causas: prev.causas.map((causa) => {
            if (causa.id !== causaId) return causa;

            const existingDilIndex = causa.diligencias.findIndex(d => d.diligenciaId === diligenciaId);
            const newDiligencias = [...causa.diligencias];

            if (existingDilIndex >= 0) {
              newDiligencias[existingDilIndex] = { ...newDiligencias[existingDilIndex], ...updates };
            } else {
              newDiligencias.push({
                diligenciaId,
                realizada: false,
                noNecesaria: false,
                fechaRealizacion: null,
                fechaReiteracion: null,
                observacion: null,
                ...updates
              } as CausaDiligencia);
            }
            
            return { ...causa, diligencias: newDiligencias };
          })
        };
      });
      
      toast.success('Actualizado');
    } catch (err) {
      console.error('Error updating:', err);
      toast.error('Error al actualizar');
    } finally {
      setUpdatingCell(null);
    }
  };

  // Calcular estadísticas
  const getStats = () => {
    if (!data) return { total: 0, realizadas: 0, noNecesarias: 0, pendientes: 0 };
    
    let realizadas = 0;
    let noNecesarias = 0;
    const total = data.causas.length * data.diligencias.length;
    
    data.causas.forEach(causa => {
      causa.diligencias.forEach(d => {
        if (d.realizada) realizadas++;
        else if (d.noNecesaria) noNecesarias++;
      });
    });
    
    return { total, realizadas, noNecesarias, pendientes: total - realizadas - noNecesarias };
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-sm text-gray-500">Cargando matriz...</span>
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center gap-3 text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">Error al cargar datos</p>
        <p className="text-sm text-red-500">{error || 'No hay datos disponibles'}</p>
      </div>
      <button 
        onClick={fetchMatrix}
        className="ml-auto px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 rounded-md transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  const stats = getStats();
  const hasFilters = selectedFiscalId || selectedCausaId;

  return (
    <div className="space-y-4">
      {/* Filtros y acciones */}
      <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Fiscal</label>
          <FiscalSelect 
            value={selectedFiscalId}
            onValueChange={setSelectedFiscalId}
          />
        </div>
        <div className="flex-1 min-w-[200px] max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Causa</label>
          <CausaSelector 
            value={selectedCausaId}
            onChange={setSelectedCausaId}
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
          <button
            onClick={generatePdf}
            disabled={!data || data.causas.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border px-4 py-3">
          <div className="text-2xl font-bold text-gray-900">{data.causas.length}</div>
          <div className="text-xs text-gray-500">Causas</div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3">
          <div className="text-2xl font-bold text-green-600">{stats.realizadas}</div>
          <div className="text-xs text-gray-500">Realizadas</div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3">
          <div className="text-2xl font-bold text-gray-500">{stats.noNecesarias}</div>
          <div className="text-xs text-gray-500">No Necesarias</div>
        </div>
        <div className="bg-white rounded-lg border px-4 py-3">
          <div className="text-2xl font-bold text-amber-600">{stats.pendientes}</div>
          <div className="text-xs text-gray-500">Pendientes</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto border rounded-lg shadow-sm bg-white max-h-[65vh]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-50 bg-slate-100 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide border-b-2 border-r border-slate-200 min-w-[200px]">
                Causa (RUC)
              </th>
              {data.diligencias.map((dil, index) => (
                <th 
                  key={dil.id}
                  className={`sticky top-0 z-40 px-2 py-2 text-center border-b-2 border-r border-slate-200 transition-colors cursor-help ${
                    hoveredCol === index ? 'bg-blue-50' : 'bg-slate-100'
                  }`}
                  style={{ minWidth: '100px', maxWidth: '120px' }}
                  onMouseEnter={() => setHoveredCol(index)}
                  onMouseLeave={() => setHoveredCol(null)}
                  title={dil.descripcion || dil.nombre}
                >
                  <span className="text-[10px] font-semibold text-slate-600 leading-tight line-clamp-3">
                    {dil.nombre}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.causas.length === 0 ? (
              <tr>
                <td colSpan={data.diligencias.length + 1} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-300" />
                    <p>No se encontraron causas con los filtros aplicados</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.causas.map((causa, rowIndex) => (
                <tr 
                  key={causa.id} 
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`transition-colors ${
                    hoveredRow === rowIndex ? 'bg-blue-50/60' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className={`sticky left-0 z-30 px-4 py-2 border-r border-b border-slate-200 transition-colors ${
                    hoveredRow === rowIndex ? 'bg-blue-50' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-800 text-xs">{causa.ruc || 'S/RUC'}</span>
                      <span 
                        className="text-[11px] text-slate-500 truncate max-w-[180px]" 
                        title={causa.denominacionCausa}
                      >
                        {causa.denominacionCausa}
                      </span>
                    </div>
                  </td>
                  {data.diligencias.map((dil, colIndex) => {
                    const cellData = causa.diligencias.find(d => d.diligenciaId === dil.id);
                    const isRealizada = cellData?.realizada || false;
                    const isNoNecesaria = cellData?.noNecesaria || false;
                    const isHoveredRow = hoveredRow === rowIndex;
                    const isHoveredCol = hoveredCol === colIndex;
                    const isIntersection = isHoveredRow && isHoveredCol;
                    const isUpdating = updatingCell?.c === causa.id && updatingCell?.d === dil.id;

                    let cellBg = '';
                    if (isRealizada) {
                      cellBg = 'bg-green-500';
                    } else if (isNoNecesaria) {
                      cellBg = 'bg-slate-400';
                    } else if (isIntersection) {
                      cellBg = 'bg-blue-100';
                    } else if (isHoveredCol) {
                      cellBg = 'bg-blue-50/50';
                    }

                    return (
                      <td 
                        key={dil.id} 
                        className={`border-r border-b border-slate-100 transition-all duration-150 ${cellBg}`}
                        style={{ minWidth: '100px', maxWidth: '120px', height: '36px' }}
                        onMouseEnter={() => setHoveredCol(colIndex)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        <div className="flex justify-center items-center h-full gap-1">
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleUpdate(causa.id, dil.id, { 
                                  realizada: !isRealizada,
                                  noNecesaria: false,
                                  fechaRealizacion: !isRealizada ? new Date().toISOString() : null
                                })}
                                className={`p-1 rounded-md transition-all duration-150 ${
                                  isRealizada 
                                    ? 'text-white bg-white/20 hover:bg-white/30' 
                                    : 'text-slate-300 hover:text-green-600 hover:bg-green-50'
                                }`}
                                title={isRealizada 
                                  ? `Realizada: ${cellData?.fechaRealizacion ? format(new Date(cellData.fechaRealizacion), 'dd/MM/yyyy') : ''}` 
                                  : "Marcar como Realizada"
                                }
                              >
                                <Check className="h-4 w-4" strokeWidth={2.5} />
                              </button>

                              <button
                                onClick={() => handleUpdate(causa.id, dil.id, { 
                                  noNecesaria: !isNoNecesaria,
                                  realizada: false
                                })}
                                className={`p-1 rounded-md transition-all duration-150 ${
                                  isNoNecesaria 
                                    ? 'text-white bg-white/20 hover:bg-white/30' 
                                    : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Marcar como No Necesaria"
                              >
                                <Minus className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Leyenda */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Realizada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
            <span>No Necesaria</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>
            <span>Pendiente</span>
          </div>
        </div>
        <span>{data.causas.length} causas · {data.diligencias.length} diligencias</span>
      </div>
    </div>
  );
};
