// src/components/charts/EstadisticasTelefonos.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ProveedorEstadistica {
  id: number;
  nombre: string;
  cantidad: number;
}

interface UbicacionEstadistica {
  id: number;
  nombre: string;
  cantidad: number;
}

interface SolicitudesEstadistica {
  trafico: number;
  imei: number;
  forense: number;
  custodia: number;
}

interface EstadisticasTelefonosProps {
  porProveedor: ProveedorEstadistica[];
  porUbicacion: UbicacionEstadistica[];
  solicitudes: SolicitudesEstadistica;
  totalTelefonos: number;
  isLoading: boolean;
}

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function EstadisticasTelefonos({
  porProveedor,
  porUbicacion,
  solicitudes,
  totalTelefonos,
  isLoading
}: EstadisticasTelefonosProps) {
  // Preparar datos para gráfico de solicitudes
  const solicitudesData = [
    { name: 'Tráfico', value: solicitudes.trafico },
    { name: 'IMEI', value: solicitudes.imei },
    { name: 'Forense', value: solicitudes.forense },
    { name: 'Custodia', value: solicitudes.custodia }
  ];

  // Función para renderizar etiquetas en el gráfico de torta
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm">
            <span className="font-medium">Cantidad:</span> {payload[0].value}
          </p>
          <p className="text-sm">
            <span className="font-medium">Porcentaje:</span> {((payload[0].value / totalTelefonos) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estadísticas de Teléfonos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="proveedores">
          <TabsList className="mb-4">
            <TabsTrigger value="proveedores">Por Proveedor</TabsTrigger>
            <TabsTrigger value="ubicaciones">Por Ubicación</TabsTrigger>
            <TabsTrigger value="solicitudes">Tipos de Solicitud</TabsTrigger>
          </TabsList>
          
          <TabsContent value="proveedores">
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={porProveedor}
                        dataKey="cantidad"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {porProveedor.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-sm">Proveedor</th>
                        <th className="text-right py-2 font-medium text-sm">Cantidad</th>
                        <th className="text-right py-2 font-medium text-sm">Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porProveedor.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.nombre}</td>
                          <td className="py-2 text-right">{item.cantidad}</td>
                          <td className="py-2 text-right">
                            {((item.cantidad / totalTelefonos) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="py-2">Total</td>
                        <td className="py-2 text-right">{totalTelefonos}</td>
                        <td className="py-2 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ubicaciones">
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={porUbicacion}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="nombre" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" name="Cantidad" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="solicitudes">
            {isLoading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={solicitudesData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {solicitudesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-blue-700">
                        {solicitudes.trafico}
                      </div>
                      <div className="text-sm text-blue-600">
                        Solicitudes de Tráfico
                      </div>
                      <div className="text-xs mt-1 text-blue-500">
                        {totalTelefonos > 0 
                          ? ((solicitudes.trafico / totalTelefonos) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-green-700">
                        {solicitudes.imei}
                      </div>
                      <div className="text-sm text-green-600">
                        Solicitudes de IMEI
                      </div>
                      <div className="text-xs mt-1 text-green-500">
                        {totalTelefonos > 0 
                          ? ((solicitudes.imei / totalTelefonos) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-yellow-700">
                        {solicitudes.forense}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Extracciones Forenses
                      </div>
                      <div className="text-xs mt-1 text-yellow-500">
                        {totalTelefonos > 0 
                          ? ((solicitudes.forense / totalTelefonos) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-purple-700">
                        {solicitudes.custodia}
                      </div>
                      <div className="text-sm text-purple-600">
                        Enviados a Custodia
                      </div>
                      <div className="text-xs mt-1 text-purple-500">
                        {totalTelefonos > 0 
                          ? ((solicitudes.custodia / totalTelefonos) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}