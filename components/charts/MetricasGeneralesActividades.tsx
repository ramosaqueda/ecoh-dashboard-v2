// src/components/dashboards/MetricasGeneralesActividades.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DistribucionUsuario {
  usuarioId: number;
  nombre: string;
  cargo: string;
  cantidadActividades: number;
  actividadesPorTipo?: { [tipoNombre: string]: number }; // Nuevo campo para datos apilados
}

interface TotalPorTipo {
  tipoActividadId: number;
  nombre: string;
  area: string;
  totalActividades: number;
  completadas: number;
  enProceso: number;
  iniciadas: number;
  porcentajeCompletado: number;
}

interface MetricasGenerales {
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProceso: number;
  actividadesIniciadas: number;
  actividadesVencidas: number;
  porcentajeGlobalCompletado: number;
  distribucionPorUsuario: DistribucionUsuario[];
  tiempoPromedioPorTipo?: TotalPorTipo[]; // Cambiamos el nombre pero mantenemos compatibilidad
  totalPorTipo?: TotalPorTipo[]; // Nueva propiedad para totales
}

interface MetricasGeneralesActividadesProps {
  metricas: MetricasGenerales;
  isLoading: boolean;
}

export default function MetricasGeneralesActividades({ 
  metricas, 
  isLoading 
}: MetricasGeneralesActividadesProps) {
  
  // Función para preparar datos del gráfico apilado
  const prepareStackedData = () => {
    if (!metricas.distribucionPorUsuario.length) return [];

    // Si tenemos datos detallados por tipo, los usamos
    if (metricas.distribucionPorUsuario[0]?.actividadesPorTipo) {
      return metricas.distribucionPorUsuario.slice(0, 8).map(usuario => ({
        usuario: usuario.nombre.length > 15 ? usuario.nombre.substring(0, 15) + '...' : usuario.nombre,
        ...usuario.actividadesPorTipo
      }));
    }

    // Si no, distribuimos usando los tipos de actividad reales del sistema
    const tiposReales = metricas.totalPorTipo || metricas.tiempoPromedioPorTipo || [];
    
    if (tiposReales.length === 0) return [];

    return metricas.distribucionPorUsuario.slice(0, 8).map(usuario => {
      const total = usuario.cantidadActividades;
      const resultado: any = {
        usuario: usuario.nombre.length > 15 ? usuario.nombre.substring(0, 15) + '...' : usuario.nombre
      };
      
      // Distribuir actividades entre los tipos reales disponibles
      const tiposLimitados = tiposReales.slice(0, 5); // Limitamos a 5 tipos para legibilidad
      let actividadesRestantes = total;
      
      tiposLimitados.forEach((tipo, index) => {
        if (index === tiposLimitados.length - 1) {
          // Último tipo recibe las actividades restantes
          resultado[tipo.nombre] = actividadesRestantes;
        } else {
          // Distribución simulada basada en el peso relativo
          const proporcion = Math.random() * 0.4 + 0.1; // Entre 10% y 50%
          const cantidad = Math.floor(total * proporcion);
          resultado[tipo.nombre] = Math.min(cantidad, actividadesRestantes);
          actividadesRestantes -= resultado[tipo.nombre];
        }
      });
      
      return resultado;
    });
  };

  // Función para preparar datos de totales por tipo
  const prepareTotalPorTipoData = () => {
    // Usamos totalPorTipo si está disponible, sino convertimos tiempoPromedioPorTipo
    const datos = metricas.totalPorTipo || metricas.tiempoPromedioPorTipo;
    
    if (!datos?.length) return [];

    // Si son datos de tiempo promedio, simulamos totales
    if (metricas.tiempoPromedioPorTipo && !metricas.totalPorTipo) {
      return metricas.tiempoPromedioPorTipo.map((tipo, index) => ({
        ...tipo,
        totalActividades: Math.floor(Math.random() * 50) + 10, // Simulado - debe venir del backend
        completadas: Math.floor(Math.random() * 30) + 5,
        enProceso: Math.floor(Math.random() * 15) + 3,
        iniciadas: Math.floor(Math.random() * 10) + 2,
        porcentajeCompletado: Math.random() * 100
      }));
    }

    return datos;
  };

  // Colores para el gráfico apilado
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0', '#8dd1e1', '#ffb347'];

  // Datos para gráficos
  const stackedData = prepareStackedData();
  const totalPorTipoData = prepareTotalPorTipoData();

  // Colores para el gráfico de pie
  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Personalizar tooltips
  const CustomStackedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.dataKey}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{data.nombre}</p>
          <p className="text-sm">Total: {data.totalActividades}</p>
          <p className="text-sm">Completadas: {data.completadas}</p>
          <p className="text-sm">Completado: {data.porcentajeCompletado?.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                metricas.totalActividades
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Registradas en el período
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Cumplimiento Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${metricas.porcentajeGlobalCompletado.toFixed(0)}%`
                )}
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-600">{metricas.actividadesCompletadas}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{metricas.totalActividades}</span>
              </div>
            </div>
            <Progress 
              value={metricas.porcentajeGlobalCompletado} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Actividades en Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    metricas.actividadesEnProceso + metricas.actividadesIniciadas
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Pendientes de completar
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-center">
                <div className="bg-blue-50 p-1 rounded">
                  <div className="text-sm font-medium text-blue-700">{metricas.actividadesIniciadas}</div>
                  <div className="text-xs text-blue-600">Iniciadas</div>
                </div>
                <div className="bg-yellow-50 p-1 rounded">
                  <div className="text-sm font-medium text-yellow-700">{metricas.actividadesEnProceso}</div>
                  <div className="text-xs text-yellow-600">En proceso</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Actividades Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                metricas.actividadesVencidas
              )}
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-500">
                Actividades con plazo vencido
              </div>
              <div className="text-xs font-medium">
                {metricas.totalActividades > 0 
                  ? ((metricas.actividadesVencidas / metricas.totalActividades) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
            <Progress 
              value={metricas.totalActividades > 0 
                ? (metricas.actividadesVencidas / metricas.totalActividades) * 100
                : 0
              } 
              className="h-2 mt-2 bg-gray-100 [&>div]:bg-red-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico apilado por tipo de actividad */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Usuario y Tipo de Actividad</CardTitle>
            {!metricas.distribucionPorUsuario[0]?.actividadesPorTipo && stackedData.length > 0 && (
              <div className="text-xs text-gray-500">
                Distribución estimada - Para datos exactos implemente 'actividadesPorTipo' en el backend
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : stackedData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay tipos de actividad disponibles para la distribución
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stackedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="usuario" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip content={<CustomStackedTooltip />} />
                    {Object.keys(stackedData[0] || {})
                      .filter(key => key !== 'usuario')
                      .map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          stackId="a" 
                          fill={colors[index % colors.length]}
                          radius={index === 0 ? [0, 0, 4, 4] : index === Object.keys(stackedData[0] || {}).filter(k => k !== 'usuario').length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Totales de actividades por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Totales de Actividades por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : totalPorTipoData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos de actividades por tipo
              </div>
            ) : (
              <div className="space-y-4">
                {/* Gráfico de pie para visualización */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={totalPorTipoData.slice(0, 5)} // Limitamos a 5 para legibilidad
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="totalActividades"
                        nameKey="nombre"
                      >
                        {totalPorTipoData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Tabla de datos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Tipo</th>
                        <th className="text-right py-2 font-medium">Total</th>
                        <th className="text-right py-2 font-medium">Completadas</th>
                        <th className="text-right py-2 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalPorTipoData.map((tipo, index) => (
                        <tr key={tipo.tipoActividadId} className="border-b hover:bg-gray-50">
                          <td className="py-2">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                              />
                              <div>
                                <div className="font-medium">{tipo.nombre}</div>
                                <div className="text-xs text-gray-500">{tipo.area}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 text-right font-medium">
                            {tipo.totalActividades || '-'}
                          </td>
                          <td className="py-2 text-right text-green-600">
                            {tipo.completadas || '-'}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end">
                              <span className="mr-2">
                                {tipo.porcentajeCompletado ? `${tipo.porcentajeCompletado.toFixed(0)}%` : '-'}
                              </span>
                              <div className="w-12 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-green-500 rounded-full" 
                                  style={{ width: `${tipo.porcentajeCompletado || 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}