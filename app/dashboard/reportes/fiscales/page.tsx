'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileDown, 
  Filter, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  ReporteFiscalesResponse, 
  ReporteFiltros, 
  DatoGrafico,
  FiscalReporte 
} from '@/types/reporte';
import { ReporteFiscalesTable } from '@/components/reportes/ReporteFiscalesTable';
import { toast } from 'sonner';

export default function ReporteFiscalesPage() {
  // Estados
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<ReporteFiscalesResponse | null>(null);
  const [filtros, setFiltros] = useState<ReporteFiltros>({});
  const [fiscales, setFiscales] = useState<{id: number; nombre: string}[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Colores para gráficos - Paleta profesional
  const COLORS = ['#00ABE4', '#1E375A', '#34D399', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];

  // Cargar fiscales para el filtro
  useEffect(() => {
    const fetchFiscales = async () => {
      try {
        const response = await fetch('/api/fiscales');
        if (response.ok) {
          const data = await response.json();
          setFiscales(data);
        }
      } catch (error) {
        console.error('Error cargando fiscales:', error);
      }
    };
    fetchFiscales();
  }, []);

  // Cargar reporte inicial
  useEffect(() => {
    fetchReporte();
  }, []);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/reportes/fiscales?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }
      
      const data: ReporteFiscalesResponse = await response.json();
      setReporteData(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: keyof ReporteFiltros, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = () => {
    fetchReporte();
  };

  const limpiarFiltros = () => {
    setFiltros({});
    // Recargar sin filtros
    setLoading(true);
    fetch('/api/reportes/fiscales')
      .then(res => res.json())
      .then(data => setReporteData(data))
      .finally(() => setLoading(false));
  };

  // Preparar datos para gráficos
  const datosGraficoBarras: DatoGrafico[] = reporteData?.resumenPorFiscal
    .filter(fiscal => fiscal.totalCausas > 0)
    .slice(0, 10) // Top 10 fiscales
    .map(fiscal => {
      // Acortar nombres de forma más inteligente
      let nombreCorto = fiscal.fiscalNombre;
      if (nombreCorto.length > 15) {
        const palabras = nombreCorto.split(' ');
        if (palabras.length >= 2) {
          // Tomar primer nombre y primer apellido
          nombreCorto = `${palabras[0]} ${palabras[palabras.length - 1]}`;
        }
        // Si aún es muy largo, truncar
        if (nombreCorto.length > 15) {
          nombreCorto = nombreCorto.substring(0, 12) + '...';
        }
      }
      
      return {
        fiscal: nombreCorto,
        causas: fiscal.totalCausas,
        causasEcoh: fiscal.causasEcoh,
        causasLegadas: fiscal.causasLegadas,
        causasCrimenOrg: fiscal.causasCrimenOrg
      };
    }) || [];

  const datosGraficoPie = reporteData?.resumenPorFiscal
    .filter(fiscal => fiscal.totalCausas > 0)
    .slice(0, 8) // Top 8 para mejor visualización
    .map(fiscal => ({
      name: fiscal.fiscalNombre,
      value: fiscal.totalCausas,
      percentage: fiscal.porcentajeDelTotal
    })) || [];

  const exportarReporte = async (formato: 'xlsx' | 'csv') => {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      params.append('formato', formato);

      const response = await fetch(`/api/reportes/fiscales/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte-fiscales-${new Date().toISOString().split('T')[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Reporte exportado en formato ${formato.toUpperCase()}`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  if (loading && !reporteData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando reporte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reporte de Causas por Fiscal</h1>
          <p className="text-muted-foreground">
            Análisis de distribución de causas entre fiscales
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button
            onClick={() => exportarReporte('xlsx')}
            className="flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar Excel</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportarReporte('csv')}
            className="flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fiscal">Fiscal</Label>
                <Select 
                  value={filtros.fiscalId?.toString() || ''} 
                  onValueChange={(value) => handleFiltroChange('fiscalId', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los fiscales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los fiscales</SelectItem>
                    {fiscales.map(fiscal => (
                      <SelectItem key={fiscal.id} value={fiscal.id.toString()}>
                        {fiscal.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="causaEcoh">Causa ECOH</Label>
                <Select 
                  value={filtros.causaEcoh?.toString() || ''} 
                  onValueChange={(value) => handleFiltroChange('causaEcoh', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="esCrimenOrganizado">Crimen Organizado</Label>
                <Select 
                  value={filtros.esCrimenOrganizado?.toString() || ''} 
                  onValueChange={(value) => handleFiltroChange('esCrimenOrganizado', value === '' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="0">Sí</SelectItem>
                    <SelectItem value="1">No</SelectItem>
                    <SelectItem value="2">Desconocido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
              <Button onClick={aplicarFiltros} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reporteData && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Causas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteData.totalCausas}</div>
                <p className="text-xs text-muted-foreground">
                  Generado el {new Date(reporteData.fechaGeneracion).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fiscales con Causas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteData.estadisticasGenerales.fiscalesConCausas}</div>
                <p className="text-xs text-muted-foreground">
                  {reporteData.estadisticasGenerales.fiscalesSinCausas} sin causas asignadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Fiscal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reporteData.estadisticasGenerales.promedioCausasPorFiscal}
                </div>
                <p className="text-xs text-muted-foreground">
                  causas por fiscal activo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Fiscal Asignado</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteData.estadisticasGenerales.causasSinFiscal}</div>
                <p className="text-xs text-muted-foreground">
                  {((reporteData.estadisticasGenerales.causasSinFiscal / reporteData.totalCausas) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Fiscales por Cantidad de Causas</CardTitle>
                <CardDescription>
                  Distribución de causas entre los fiscales más activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={datosGraficoBarras} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fiscal" 
                      angle={-35}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      fontSize={11}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="causas" fill="#00ABE4" name="Total Causas" />
                    <Bar dataKey="causasEcoh" fill="#1E375A" name="ECOH" />
                    <Bar dataKey="causasLegadas" fill="#F59E0B" name="Legadas" />
                    <Bar dataKey="causasCrimenOrg" fill="#34D399" name="Crimen Org." />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Circular */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución Porcentual</CardTitle>
                <CardDescription>
                  Porcentaje de causas por fiscal (Top 8)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={datosGraficoPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => {
                        const nombreCorto = name.length > 15 
                          ? name.split(' ')[0] + ' ' + name.split(' ').slice(-1)[0]
                          : name;
                        return `${nombreCorto}: ${percentage.toFixed(1)}%`;
                      }}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosGraficoPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, 'Causas']}
                      labelFormatter={(label: string) => `Fiscal: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Detalle */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Causas</CardTitle>
              <CardDescription>
                Listado completo de causas incluidas en el reporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReporteFiscalesTable 
                data={reporteData.detallesCausas}
                onExport={exportarReporte}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}