// src/components/charts/DistribucionDelitos.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DelitoDistribucion {
  delitoId: number;
  nombre: string;
  causas: number;
  imputados: number;
  formalizados: number;
  porcentaje: number;
}

interface DistribucionDelitosProps {
  datos: DelitoDistribucion[];
  isLoading: boolean;
}

export default function DistribucionDelitos({ datos, isLoading }: DistribucionDelitosProps) {
  // Definir colores para las barras
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const delito = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{delito.nombre}</p>
          <div className="text-xs space-y-1 mt-1">
            <p><span className="font-medium">Causas:</span> {delito.causas}</p>
            <p><span className="font-medium">Imputados:</span> {delito.imputados}</p>
            <p><span className="font-medium">Formalizados:</span> {delito.formalizados}</p>
            <p><span className="font-medium">% de formalización:</span> {delito.porcentaje.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Distribución por Tipo de Delito</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : datos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No hay datos disponibles para mostrar
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos.sort((a, b) => b.formalizados - a.formalizados)}
                margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Imputados', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Porcentaje', angle: 90, position: 'insideRight' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="imputados" fill="#8884d8" name="Imputados">
                  {datos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
                <Bar yAxisId="left" dataKey="formalizados" fill="#82ca9d" name="Formalizados">
                  {datos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[(index + 2) % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Tabla de datos */}
        {datos.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delito</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Causas</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Imputados</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Formalizados</th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {datos.map((delito) => (
                  <tr key={delito.delitoId}>
                    <td className="px-3 py-2 text-left font-medium">{delito.nombre}</td>
                    <td className="px-3 py-2 text-right">{delito.causas}</td>
                    <td className="px-3 py-2 text-right">{delito.imputados}</td>
                    <td className="px-3 py-2 text-right">{delito.formalizados}</td>
                    <td className="px-3 py-2 text-right font-medium">{delito.porcentaje.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}