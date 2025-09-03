'use client';

import { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

interface EstadosData {
  name: string;
  value: number;
  color: string;
}

interface TiposActividadData {
  nombre: string;
  pendientes: number;
  completadas: number;
  total: number;
}

const COLORS = {
  inicio: '#fbbf24', // yellow-400
  en_proceso: '#3b82f6', // blue-500
  terminado: '#10b981', // green-500
};

export default function ActividadesCharts() {
  const [estadosData, setEstadosData] = useState<EstadosData[]>([]);
  const [tiposData, setTiposData] = useState<TiposActividadData[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/usuarios/me');
      if (!response.ok) throw new Error('Error al obtener usuario');
      
      const userData = await response.json();
      const userWithRole = await fetch(`/api/usuarios?roles=${userData.rolId || 3}`);
      
      if (userWithRole.ok) {
        const usersData = await userWithRole.json();
        const foundUser = usersData.find((u: Usuario) => u.id === userData.id);
        if (foundUser) {
          setCurrentUser(foundUser);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Obtener datos para gráficos
  const fetchChartsData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/actividades?limit=1000&include_assigned=true');
      if (!response.ok) throw new Error('Error al cargar actividades');
      
      const jsonResponse = await response.json();
      const data = jsonResponse.data || [];
      
      // Filtrar actividades relacionadas con el usuario
      const misActividades = data.filter((a: any) => {
        const esAsignadaAMi = (a.usuarioAsignado?.id || a.usuario?.id) === currentUser.id;
        const esAsignadaPorMi = a.usuario?.id === currentUser.id;
        return esAsignadaAMi || esAsignadaPorMi;
      });
      
      // Datos para gráfico de estados
      const estadosCount = misActividades.reduce((acc: any, actividad: any) => {
        acc[actividad.estado] = (acc[actividad.estado] || 0) + 1;
        return acc;
      }, {});
      
      const estadosChartData: EstadosData[] = [
        { name: 'Por Iniciar', value: estadosCount.inicio || 0, color: COLORS.inicio },
        { name: 'En Proceso', value: estadosCount.en_proceso || 0, color: COLORS.en_proceso },
        { name: 'Completadas', value: estadosCount.terminado || 0, color: COLORS.terminado }
      ].filter(item => item.value > 0);
      
      // Datos para gráfico de tipos de actividad
      const tiposCount = misActividades.reduce((acc: any, actividad: any) => {
        const tipo = actividad.tipoActividad.nombre;
        if (!acc[tipo]) {
          acc[tipo] = { pendientes: 0, completadas: 0, total: 0 };
        }
        acc[tipo].total++;
        if (actividad.estado === 'terminado') {
          acc[tipo].completadas++;
        } else {
          acc[tipo].pendientes++;
        }
        return acc;
      }, {});
      
      const tiposChartData: TiposActividadData[] = Object.entries(tiposCount)
        .map(([nombre, counts]: [string, any]) => ({
          nombre: nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre,
          pendientes: counts.pendientes,
          completadas: counts.completadas,
          total: counts.total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8); // Top 8 tipos
      
      setEstadosData(estadosChartData);
      setTiposData(tiposChartData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchChartsData();
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de estados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estadosData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de tipos de actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Actividades por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tiposData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tiposData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="completadas" 
                    fill="#10b981" 
                    name="Completadas"
                    stackId="a" 
                  />
                  <Bar 
                    dataKey="pendientes" 
                    fill="#3b82f6" 
                    name="Pendientes"
                    stackId="a" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}