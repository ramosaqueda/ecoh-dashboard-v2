// src/components/dashboards/MetricasGeneralesActividades.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DistribucionUsuario {
  usuarioId: number;
  nombre: string;
  cargo: string;
  cantidadActividades: number;
}

interface TiempoPromedioTipo {
  tipoActividadId: number;
  nombre: string;
  area: string;
  diasPromedio: number;
}

interface MetricasGenerales {
  totalActividades: number;
  actividadesCompletadas: number;
  actividadesEnProceso: number;
  actividadesIniciadas: number;
  actividadesVencidas: number;
  porcentajeGlobalCompletado: number;
  distribucionPorUsuario: DistribucionUsuario[];
  tiempoPromedioPorTipo: TiempoPromedioTipo[];
}

interface MetricasGeneralesActividadesProps {
  metricas: MetricasGenerales;
  isLoading: boolean;
}

export default function MetricasGeneralesActividades({ 
  metricas, 
  isLoading 
}: MetricasGeneralesActividadesProps) {
  // Personalizar el tooltip del gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Actividades:</span> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribución por Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
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
                  data={metricas.distribucionPorUsuario.slice(0, 10)} // Limitamos a los 10 primeros para legibilidad
                  margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="nombre" 
                    tick={{ fontSize: 12 }} 
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidadActividades" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Tiempo Promedio por Tipo de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : metricas.tiempoPromedioPorTipo.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No hay suficientes datos para calcular tiempos promedio
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-sm">Tipo de Actividad</th>
                    <th className="text-left py-2 font-medium text-sm">Área</th>
                    <th className="text-right py-2 font-medium text-sm">Días Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.tiempoPromedioPorTipo.map((tipo) => (
                    <tr key={tipo.tipoActividadId} className="border-b">
                      <td className="py-2">{tipo.nombre}</td>
                      <td className="py-2 text-gray-600">{tipo.area}</td>
                      <td className="py-2 text-right font-medium">
                        {tipo.diasPromedio.toFixed(1)} días
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}