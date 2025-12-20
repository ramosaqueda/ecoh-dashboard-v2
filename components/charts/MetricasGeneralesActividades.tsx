// src/components/dashboards/MetricasGeneralesActividades.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DistribucionUsuario {
  usuarioId: number;
  nombre: string;
  cargo: string;
  cantidadActividades: number;
  actividadesPorTipo?: { [tipoNombre: string]: number };
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
  tiempoPromedioPorTipo?: TotalPorTipo[];
  totalPorTipo?: TotalPorTipo[];
  distribucionPorEstamento?: { estamento: string; cantidad: number }[];
}

interface MetricasGeneralesActividadesProps {
  metricas: MetricasGenerales;
  isLoading: boolean;
}

export default function MetricasGeneralesActividades({ 
  metricas, 
  isLoading 
}: MetricasGeneralesActividadesProps) {
  
  // Colores para gráficos
  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const totalPorTipoData = metricas.totalPorTipo || [];

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

  console.log('=== COMPONENTE MetricasGeneralesActividades ===');
  console.log('metricas.distribucionPorEstamento:', metricas.distribucionPorEstamento);

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

      {/* Gráfico de Distribución por Estamento */}
      {metricas.distribucionPorEstamento && metricas.distribucionPorEstamento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estamento</CardTitle>
            <CardDescription>
              Comparativa de actividades entre departamentos (Analistas, Abogados, ATVT, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metricas.distribucionPorEstamento}
                  margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="estamento" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow-md">
                            <p className="text-sm font-medium">{data.estamento}</p>
                            <p className="text-sm font-bold text-purple-600">
                              Total: {data.cantidad} actividades
                            </p>
                            <p className="text-xs text-gray-500">
                              {((data.cantidad / metricas.totalActividades) * 100).toFixed(1)}% del total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="cantidad" 
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico simple de distribución por usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Actividades por Usuario</CardTitle>
            <CardDescription>
              Total de actividades asignadas a cada usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : metricas.distribucionPorUsuario.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos de distribución por usuario
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricas.distribucionPorUsuario.slice(0, 10)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="nombre" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-md">
                              <p className="text-sm font-medium">{data.nombre}</p>
                              <p className="text-sm text-gray-600">{data.cargo}</p>
                              <p className="text-sm font-bold text-blue-600">
                                Total: {data.cantidadActividades} actividades
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="cantidadActividades" 
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
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
                        data={totalPorTipoData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="totalActividades"
                        nameKey="nombre"
                      >
                        {totalPorTipoData.slice(0, 5).map((entry: any, index: number) => (
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
                      {totalPorTipoData.map((tipo: any, index: number) => (
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