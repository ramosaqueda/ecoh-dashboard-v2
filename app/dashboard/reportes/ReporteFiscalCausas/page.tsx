'use client'
import React, { useState, useEffect } from 'react';
import { Download, Users, Scale, FileText, AlertTriangle, RefreshCw } from 'lucide-react';

// Interfaces basadas en el esquema Prisma
interface Cautelar {
  id: number;
  nombre: string;
}

interface Imputado {
  id: number;
  nombreSujeto: string;
  docId: string;
  formalizado: boolean;
  fechaFormalizacion: string | null;
  cautelar: Cautelar | null;
  tienePrisionPreventiva: boolean;
  tieneInternacionProvisoria: boolean;
}

interface Causa {
  id: number;
  denominacionCausa: string;
  ruc: string | null;
  fechaDelHecho: string | null;
  rit: string | null;
  numeroIta: string | null;
  numeroPpp: string | null;
  observacion: string | null;
  imputados: Imputado[];
}

interface Fiscal {
  id: number;
  nombre: string;
  causas: Causa[];
}

interface Estadisticas {
  totalFiscales: number;
  totalCausas: number;
  totalImputados: number;
  imputadosFormalizados: number;
  conPrisionPreventiva: number;
  conInternacionProvisoria: number;
}

interface DatosReporte {
  fiscales: Fiscal[];
  estadisticas: Estadisticas;
}

interface FilaTabla {
  fiscal: string;
  causa: string;
  ruc: string;
  rit: string;
  fechaHecho: string;
  imputado: string;
  formalizado: string;
  cautelar: string;
  esPrisionOInternacion: string;
}

const ReporteFiscalCausas = () => {
  const [datos, setDatos] = useState<DatosReporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroFiscal, setFiltroFiscal] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDatos = async () => {
    try {
      setError(null);
      const response = await fetch('/api/reportes/fiscal-causas');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar datos');
      }
      
      setDatos(result.data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDatos();
  };

  const obtenerDatosFiltrados = (): Fiscal[] => {
    if (!datos) return [];
    if (filtroFiscal === 'todos') return datos.fiscales;
    return datos.fiscales.filter(fiscal => fiscal.id === parseInt(filtroFiscal));
  };

  const generarDatosTabla = (): FilaTabla[] => {
    const fiscalesFiltrados = obtenerDatosFiltrados();
    const filas: FilaTabla[] = [];

    fiscalesFiltrados.forEach(fiscal => {
      fiscal.causas.forEach(causa => {
        if (causa.imputados.length === 0) {
          // Causa sin imputados
          filas.push({
            fiscal: fiscal.nombre,
            causa: causa.denominacionCausa,
            ruc: causa.ruc || 'Sin RUC',
            rit: causa.rit || 'Sin RIT',
            fechaHecho: causa.fechaDelHecho ? new Date(causa.fechaDelHecho).toLocaleDateString() : 'Sin fecha',
            imputado: 'Sin imputados',
            formalizado: 'N/A',
            cautelar: 'N/A',
            esPrisionOInternacion: 'N/A'
          });
        } else {
          causa.imputados.forEach(imputado => {
            filas.push({
              fiscal: fiscal.nombre,
              causa: causa.denominacionCausa,
              ruc: causa.ruc || 'Sin RUC',
              rit: causa.rit || 'Sin RIT',
              fechaHecho: causa.fechaDelHecho ? new Date(causa.fechaDelHecho).toLocaleDateString() : 'Sin fecha',
              imputado: imputado.nombreSujeto,
              formalizado: imputado.formalizado ? 'Sí' : 'No',
              cautelar: imputado.cautelar?.nombre || 'Sin medida',
              esPrisionOInternacion: (imputado.tienePrisionPreventiva || imputado.tieneInternacionProvisoria) ? 'Sí' : 'No'
            });
          });
        }
      });
    });

    return filas;
  };

  const exportarAExcel = () => {
    const datosTabla = generarDatosTabla();
    const headers = [
      'Fiscal',
      'Causa',
      'RUC',
      'RIT',
      'Fecha del Hecho',
      'Imputado',
      'Formalizado',
      'Medida Cautelar',
      'Prisión/Internación'
    ];

    let csv = headers.join(',') + '\n';
    datosTabla.forEach(fila => {
      csv += [
        `"${fila.fiscal}"`,
        `"${fila.causa}"`,
        `"${fila.ruc}"`,
        `"${fila.rit}"`,
        `"${fila.fechaHecho}"`,
        `"${fila.imputado}"`,
        `"${fila.formalizado}"`,
        `"${fila.cautelar}"`,
        `"${fila.esPrisionOInternacion}"`
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_fiscal_causas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const calcularEstadisticasFiscal = (fiscal: Fiscal) => {
    const totalCausas = fiscal.causas.length;
    const totalImputados = fiscal.causas.reduce((acc, causa) => acc + causa.imputados.length, 0);
    const formalizados = fiscal.causas.reduce((acc, causa) => 
      acc + causa.imputados.filter(imp => imp.formalizado).length, 0);
    const prisionPreventiva = fiscal.causas.reduce((acc, causa) => 
      acc + causa.imputados.filter(imp => imp.tienePrisionPreventiva).length, 0);
    const internacionProvisoria = fiscal.causas.reduce((acc, causa) => 
      acc + causa.imputados.filter(imp => imp.tieneInternacionProvisoria).length, 0);

    return {
      totalCausas,
      totalImputados,
      formalizados,
      prisionPreventiva,
      internacionProvisoria
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-lg font-medium">Cargando reporte...</div>
          <div className="text-sm text-gray-500 mt-2">Consultando base de datos</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el reporte</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  const datosTabla = generarDatosTabla();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporte de Causas por Fiscal</h1>
          <p className="text-gray-600 mt-2">
            Análisis de causas asignadas e imputados con medidas cautelares
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={exportarAExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Fiscales</p>
              <p className="text-2xl font-bold text-blue-900">{datos.estadisticas.totalFiscales}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Total Causas</p>
              <p className="text-2xl font-bold text-purple-900">{datos.estadisticas.totalCausas}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Total Imputados</p>
              <p className="text-2xl font-bold text-green-900">{datos.estadisticas.totalImputados}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Formalizados</p>
              <p className="text-2xl font-bold text-yellow-900">{datos.estadisticas.imputadosFormalizados}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Prisión Preventiva</p>
              <p className="text-2xl font-bold text-red-900">{datos.estadisticas.conPrisionPreventiva}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600">Internación Provisoria</p>
              <p className="text-2xl font-bold text-orange-900">{datos.estadisticas.conInternacionProvisoria}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Fiscal
            </label>
            <select
              value={filtroFiscal}
              onChange={(e) => setFiltroFiscal(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los Fiscales</option>
              {datos.fiscales.map(fiscal => (
                <option key={fiscal.id} value={fiscal.id}>
                  {fiscal.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detalle de Causas e Imputados</h3>
          <p className="text-sm text-gray-600">
            Mostrando {datosTabla.length} registros
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiscal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Causa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RIT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imputado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medida Cautelar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prisión/Internación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datosTabla.map((fila, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fila.fiscal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={fila.causa}>
                      {fila.causa}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fila.ruc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fila.rit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fila.imputado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fila.formalizado === 'Sí' 
                        ? 'bg-green-100 text-green-800' 
                        : fila.formalizado === 'No'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {fila.formalizado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ['Prisión Preventiva', 'Internación Provisoria'].includes(fila.cautelar)
                        ? 'bg-red-100 text-red-800'
                        : fila.cautelar === 'Sin medida' || fila.cautelar === 'N/A'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {fila.cautelar}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fila.esPrisionOInternacion === 'Sí' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {fila.esPrisionOInternacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {datosTabla.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay datos que mostrar con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Resumen por Fiscal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen por Fiscal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obtenerDatosFiltrados().map(fiscal => {
            const stats = calcularEstadisticasFiscal(fiscal);

            return (
              <div key={fiscal.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 truncate" title={fiscal.nombre}>
                  {fiscal.nombre}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Causas:</span>
                    <span className="font-medium">{stats.totalCausas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imputados:</span>
                    <span className="font-medium">{stats.totalImputados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formalizados:</span>
                    <span className="font-medium">{stats.formalizados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prisión Preventiva:</span>
                    <span className="font-medium text-red-600">{stats.prisionPreventiva}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Internación Provisoria:</span>
                    <span className="font-medium text-orange-600">{stats.internacionProvisoria}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {obtenerDatosFiltrados().length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay fiscales que mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteFiscalCausas;