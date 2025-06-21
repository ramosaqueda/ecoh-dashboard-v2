'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  Network,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CausaRelacionada {
  id: number;
  ruc: string;
  denominacion: string;
  estado: string;
  comoCausaMadre: {
    total: number;
    relaciones: Array<{
      id: number;
      causaHija: {
        id: number;
        ruc: string;
        denominacion: string;
        estado: string;
      };
      tipoRelacion: string | null;
      fechaRelacion: string;
      observacion: string | null;
    }>;
  };
  comoCausaHija: {
    total: number;
    relaciones: Array<{
      id: number;
      causaMadre: {
        id: number;
        ruc: string;
        denominacion: string;
        estado: string;
      };
      tipoRelacion: string | null;
      fechaRelacion: string;
      observacion: string | null;
    }>;
  };
  totales: {
    relacionesTotales: number;
    comoMadre: number;
    comoHija: number;
  };
}

interface ReporteData {
  estadisticas: {
    totalCausas: number;
    totalRelaciones: number;
    causaConMasRelaciones: CausaRelacionada | null;
  };
  causas: CausaRelacionada[];
  filtros: {
    tipoRelacion: string | null;
    fechaDesde: string | null;
    fechaHasta: string | null;
    formato: string;
  };
}

interface ResumenData {
  resumen: {
    totalCausasConRelaciones: number;
    totalRelaciones: number;
    causasMadre: number;
    causasArista: number;
    topCausasMadre: Array<{
      id: number;
      ruc: string;
      denominacion: string;
      totalRelaciones: number;
    }>;
    tiposRelacionMasComunes: Array<{
      tipoRelacion: string | null;
      _count: { tipoRelacion: number };
    }>;
  };
}

export default function CausasRelacionadasReporte() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [tiposRelacion, setTiposRelacion] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); // ✅ false por defecto
  const [vistaActual, setVistaActual] = useState<'detallado' | 'resumen'>('resumen');
  
  // Filtros con valores iniciales consistentes
  const [filtros, setFiltros] = useState({
    tipoRelacion: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [causaExpandida, setCausaExpandida] = useState<number | null>(null);

  // 🔥 YA NO NECESITAMOS mounted FLAG (Dynamic import lo maneja)
  // Cargar tipos de relación disponibles
  useEffect(() => {
    const fetchTiposRelacion = async () => {
      try {
        const response = await fetch('/api/causas-relacionadas', {
          method: 'OPTIONS'
        });
        if (response.ok) {
          const data = await response.json();
          setTiposRelacion(data.tiposRelacion || []);
        }
      } catch (error) {
        console.error('Error cargando tipos de relación:', error);
      }
    };

    fetchTiposRelacion();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('reporte', 'completo');
      params.append('formato', vistaActual);
      
      if (filtros.tipoRelacion) {
        params.append('tipo_relacion', filtros.tipoRelacion);
      }
      if (filtros.fechaDesde) {
        params.append('fecha_desde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fecha_hasta', filtros.fechaHasta);
      }

      const response = await fetch(`/api/causas-relacionadas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }

      const result = await response.json();
      
      if (vistaActual === 'resumen') {
        setResumenData(result);
        setData(null);
      } else {
        setData(result);
        setResumenData(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando cambie la vista
  useEffect(() => {
    fetchData();
  }, [vistaActual]);

  const aplicarFiltros = () => {
    fetchData();
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoRelacion: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  const exportarDatos = () => {
    const dataToExport = vistaActual === 'resumen' ? resumenData : data;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `causas-relacionadas-${vistaActual}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado exitosamente');
  };

  // 🔥 YA NO NECESITAMOS verificar mounted (Dynamic import lo maneja)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reporte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8" />
            Reporte de Causas Relacionadas
          </h1>
          <p className="text-muted-foreground">
            Análisis de relaciones entre causas en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vistaActual === 'resumen' ? 'default' : 'outline'}
            onClick={() => setVistaActual('resumen')}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </Button>
          <Button
            variant={vistaActual === 'detallado' ? 'default' : 'outline'}
            onClick={() => setVistaActual('detallado')}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Detallado
          </Button>
          <Button onClick={exportarDatos} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Relación</label>
              <Select value={filtros.tipoRelacion} onValueChange={(value) => 
                setFiltros(prev => ({ ...prev, tipoRelacion: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {tiposRelacion.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Fecha Desde</label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Resumen */}
      {vistaActual === 'resumen' && resumenData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas con Relaciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.totalCausasConRelaciones}</div>
              <p className="text-xs text-muted-foreground">
                Total de causas relacionadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Relaciones</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.totalRelaciones}</div>
              <p className="text-xs text-muted-foreground">
                Vínculos establecidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas Madre</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.causasMadre}</div>
              <p className="text-xs text-muted-foreground">
                Con causas hijas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas Arista</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.causasArista}</div>
              <p className="text-xs text-muted-foreground">
                Dependientes de otras
              </p>
            </CardContent>
          </Card>

          {/* Top Causas Madre */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top Causas con Más Relaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resumenData.resumen.topCausasMadre.map((causa, index) => (
                  <div key={causa.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">{causa.ruc}</span>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {causa.denominacion}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {causa.totalRelaciones} relaciones
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipos de Relación */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tipos de Relación Más Comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resumenData.resumen.tiposRelacionMasComunes.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {tipo.tipoRelacion || 'Sin especificar'}
                    </span>
                    <Badge variant="outline">
                      {tipo._count.tipoRelacion}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista Detallada */}
      {vistaActual === 'detallado' && data && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{data.estadisticas.totalCausas}</div>
                <p className="text-sm text-muted-foreground">Causas con relaciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{data.estadisticas.totalRelaciones}</div>
                <p className="text-sm text-muted-foreground">Total de relaciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Causa con más relaciones:</div>
                <p className="text-sm text-muted-foreground">
                  {data.estadisticas.causaConMasRelaciones?.ruc || 'N/A'} 
                  ({data.estadisticas.causaConMasRelaciones?.totales.relacionesTotales || 0} relaciones)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Causas */}
          <Card>
            <CardHeader>
              <CardTitle>Causas con Relaciones Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUC</TableHead>
                    <TableHead>Denominación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Como Madre</TableHead>
                    <TableHead className="text-center">Como Hija</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.causas.map((causa) => (
                    <>
                      <TableRow key={causa.id}>
                        <TableCell className="font-medium">{causa.ruc}</TableCell>
                        <TableCell className="max-w-xs truncate">{causa.denominacion}</TableCell>
                        <TableCell>
                          <Badge variant={causa.estado === 'ACTIVA' ? 'default' : 'secondary'}>
                            {causa.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{causa.totales.comoMadre}</TableCell>
                        <TableCell className="text-center">{causa.totales.comoHija}</TableCell>
                        <TableCell className="text-center font-medium">
                          {causa.totales.relacionesTotales}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCausaExpandida(
                              causaExpandida === causa.id ? null : causa.id
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {/* Detalles expandidos */}
                      {causaExpandida === causa.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50">
                            <div className="p-4 space-y-4">
                              {/* Como Causa Madre */}
                              {causa.comoCausaMadre.total > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Como Causa Madre ({causa.comoCausaMadre.total}):</h4>
                                  <div className="space-y-2">
                                    {causa.comoCausaMadre.relaciones.map((rel) => (
                                      <div key={rel.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{rel.causaHija.ruc}</p>
                                            <p className="text-sm text-muted-foreground">{rel.causaHija.denominacion}</p>
                                            {rel.observacion && (
                                              <p className="text-xs text-muted-foreground mt-1">{rel.observacion}</p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            {rel.tipoRelacion && (
                                              <Badge variant="outline" className="mb-1">{rel.tipoRelacion}</Badge>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(rel.fechaRelacion).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Como Causa Hija */}
                              {causa.comoCausaHija.total > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Como Causa Hija ({causa.comoCausaHija.total}):</h4>
                                  <div className="space-y-2">
                                    {causa.comoCausaHija.relaciones.map((rel) => (
                                      <div key={rel.id} className="border-l-4 border-green-500 pl-4 py-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{rel.causaMadre.ruc}</p>
                                            <p className="text-sm text-muted-foreground">{rel.causaMadre.denominacion}</p>
                                            {rel.observacion && (
                                              <p className="text-xs text-muted-foreground mt-1">{rel.observacion}</p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            {rel.tipoRelacion && (
                                              <Badge variant="outline" className="mb-1">{rel.tipoRelacion}</Badge>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(rel.fechaRelacion).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}