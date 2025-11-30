"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

import FiscalSelect from '@/components/select/FiscalSelect';
import CausaSelector from '@/components/select/CausaSelector';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Download } from 'lucide-react';

// @ts-expect-error: pdfMake vfs assignment workaround
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

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

  const generatePdf = () => {
    if (!data) return;

    const docDefinition: any = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Matriz de Diligencias', style: 'header' },
        { text: `Fecha de reporte: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            body: [
              // Header Row
              [
                { text: 'Causa (RUC)', style: 'tableHeader' },
                ...data.diligencias.map(d => ({
                  stack: [
                    { text: d.nombre, style: 'tableHeader', alignment: 'center' },
                    { text: d.descripcion || '', style: 'tableHeaderSmall', alignment: 'center', margin: [0, 2, 0, 0] }
                  ],
                  style: 'tableHeader',
                  alignment: 'center'
                }))
              ],
              // Data Rows
              ...data.causas.map(causa => {
                return [
                  { text: `${causa.ruc || 'S/RUC'}\n${causa.denominacionCausa}`, style: 'cellCausa' },
                  ...data.diligencias.map(dil => {
                    const cellData = causa.diligencias.find(d => d.diligenciaId === dil.id);
                    let text = '';
                    let fillColor = '';

                    if (cellData?.realizada) {
                      text = 'Realizada';
                      fillColor = '#6aa84f'; // Custom green
                    } else if (cellData?.noNecesaria) {
                      text = 'No Necesaria';
                      fillColor = '#999999'; // Custom gray
                    }

                    return { text, style: 'cellStatus', fillColor, alignment: 'center' };
                  })
                ];
              })
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 20]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          fillColor: '#f3f4f6' // gray-50
        },
        tableHeaderSmall: {
          fontSize: 8,
          color: '#6b7280', // gray-500
          italics: true
        },
        cellCausa: {
          fontSize: 9
        },
        cellStatus: {
          fontSize: 8
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('matriz_diligencias.pdf');
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

      // Optimistic update
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
      <AlertCircle className="h-5 w-5" />
      {error || 'No data available'}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Fiscal</label>
          <FiscalSelect 
            value={selectedFiscalId}
            onValueChange={setSelectedFiscalId}
          />
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Causa</label>
          <CausaSelector 
            value={selectedCausaId}
            onChange={setSelectedCausaId}
          />
        </div>
        <button
          onClick={generatePdf}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      <div className="overflow-auto border rounded-lg shadow-sm bg-white max-h-[75vh] w-full">
        <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
          <thead className="bg-gray-100">
            <tr>
              <th className="sticky left-0 top-0 z-50 bg-gray-100 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r min-w-[200px] shadow-sm">
                Causa (RUC)
              </th>
              {data.diligencias.map((dil, index) => (
                <th 
                  key={dil.id}
                  className={`sticky top-0 z-40 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[120px] cursor-help shadow-sm ${
                    hoveredCol === index ? 'bg-blue-50' : 'bg-gray-100'
                  }`}
                  onMouseEnter={() => setHoveredCol(index)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="relative w-full h-full flex flex-col items-center justify-center group">
                    <div className="truncate w-full" title={dil.nombre}>
                      {dil.nombre}
                    </div>
                    {dil.descripcion && (
                      <div className="truncate w-full text-[10px] text-gray-400 font-normal mt-0.5 leading-tight" title={dil.descripcion}>
                        {dil.descripcion}
                      </div>
                    )}
                    {/* Tooltip for full description */}
                    <div className="absolute hidden group-hover:block z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs rounded p-2 shadow-lg font-normal normal-case">
                      <div className="font-bold mb-1">{dil.nombre}</div>
                      {dil.descripcion || 'Sin descripción'}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.causas.map((causa, rowIndex) => (
              <tr 
                key={causa.id} 
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className={`sticky left-0 z-30 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-b transition-colors ${
                  hoveredRow === rowIndex ? 'bg-blue-50' : 'bg-white'
                }`}>
                  <div className="flex flex-col">
                    <span>{causa.ruc || 'S/RUC'}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[180px]" title={causa.denominacionCausa}>
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

                let bgClass = 'bg-white';
                if (isRealizada) {
                    bgClass = isHoveredRow || isHoveredCol ? 'bg-[#6aa84f]/80' : 'bg-[#6aa84f]';
                } else if (isNoNecesaria) {
                    bgClass = isHoveredRow || isHoveredCol ? 'bg-[#999999]/80' : 'bg-[#999999]';
                } else {
                    if (isIntersection) bgClass = 'bg-blue-100';
                    else if (isHoveredRow || isHoveredCol) bgClass = 'bg-blue-50';
                }

                return (
                  <td 
                    key={dil.id} 
                    className={`px-3 py-4 whitespace-nowrap text-center border-r border-b border-gray-100 relative transition-colors ${bgClass} ${isRealizada || isNoNecesaria ? 'text-white' : ''}`}
                    onMouseEnter={() => setHoveredCol(colIndex)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <div className="flex justify-center gap-1">
                      {isUpdating ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdate(causa.id, dil.id, { 
                              realizada: !isRealizada,
                              noNecesaria: false, // Mutually exclusive
                              fechaRealizacion: !isRealizada ? new Date().toISOString() : null
                            })}
                            className={`p-1 rounded transition-colors ${
                              isRealizada 
                                ? 'text-white hover:bg-white/20' 
                                : 'text-gray-300 hover:bg-gray-100'
                            }`}
                            title={isRealizada ? `Realizada: ${cellData?.fechaRealizacion ? format(new Date(cellData.fechaRealizacion), 'dd/MM/yyyy') : ''}` : "Marcar como Realizada"}
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleUpdate(causa.id, dil.id, { 
                              noNecesaria: !isNoNecesaria,
                              realizada: false // Mutually exclusive
                            })}
                            className={`p-1 rounded transition-colors ${
                              isNoNecesaria 
                                ? 'text-white hover:bg-white/20' 
                                : 'text-gray-300 hover:bg-gray-100'
                            }`}
                            title="No Necesaria"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

