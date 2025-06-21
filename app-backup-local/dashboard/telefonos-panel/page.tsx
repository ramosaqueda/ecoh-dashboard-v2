'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Download, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Importamos los componentes existentes de tabla de teléfonos
import { columns, Telefono } from '@/components/tables/telefono-tables/columns';
import { TelefonosDataTable } from '@/components/tables/telefono-tables/telefonos-table';

// Interfaces TypeScript
interface DatoGrafico {
  id: number;
  nombre: string;
  cantidad: number;
}

interface SolicitudesData {
  trafico: number;
  imei: number;
  forense: number;
  custodia: number;
}

interface EstadisticasData {
  porProveedor: DatoGrafico[];
  porUbicacion: DatoGrafico[];
  solicitudes: SolicitudesData;
  totalTelefonos: number;
}

interface EstadisticasSectionProps {
  estadisticas: EstadisticasData;
  isLoading: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface Ubicacion {
  id: number;
  nombre: string;
}

interface SearchParams {
  ruc?: string;
  proveedorId?: string;
  ubicacionId?: string;
  solicitud?: string;
}

// Componente estadístico simplificado
const EstadisticasSection = ({ estadisticas, isLoading }: EstadisticasSectionProps) => {
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Formateamos los datos para los gráficos
  const datosProveedores = estadisticas.porProveedor;
  const datosUbicaciones = estadisticas.porUbicacion;
  const datosSolicitudes = [
    { name: 'Tráfico', value: estadisticas.solicitudes.trafico },
    { name: 'IMEI', value: estadisticas.solicitudes.imei },
    { name: 'Forense', value: estadisticas.solicitudes.forense },
    { name: 'Custodia', value: estadisticas.solicitudes.custodia }
  ];

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
            <span className="font-medium">Porcentaje:</span> {
              ((payload[0].value / estadisticas.totalTelefonos) * 100).toFixed(1)
            }%
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
            ) : estadisticas.totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosProveedores}
                        dataKey="cantidad"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {datosProveedores.map((entry, index) => (
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
                      {datosProveedores.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.nombre}</td>
                          <td className="py-2 text-right">{item.cantidad}</td>
                          <td className="py-2 text-right">
                            {((item.cantidad / estadisticas.totalTelefonos) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="py-2">Total</td>
                        <td className="py-2 text-right">{estadisticas.totalTelefonos}</td>
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
            ) : estadisticas.totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datosUbicaciones}
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
            ) : estadisticas.totalTelefonos === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosSolicitudes}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {datosSolicitudes.map((entry, index) => (
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
                        {estadisticas.solicitudes.trafico}
                      </div>
                      <div className="text-sm text-blue-600">
                        Solicitudes de Tráfico
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-green-700">
                        {estadisticas.solicitudes.imei}
                      </div>
                      <div className="text-sm text-green-600">
                        Solicitudes de IMEI
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-yellow-700">
                        {estadisticas.solicitudes.forense}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Extracciones Forenses
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-purple-700">
                        {estadisticas.solicitudes.custodia}
                      </div>
                      <div className="text-sm text-purple-600">
                        Enviados a Custodia
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
};

export default function TelefonosPanelPage() {
  // Estados para filtros
  const [rucBusqueda, setRucBusqueda] = useState<string>('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string>('all');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<string>('all');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<string>('all');
  
  // Estados para datos
  const [telefonos, setTelefonos] = useState<Telefono[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({
    porProveedor: [],
    porUbicacion: [],
    solicitudes: {
      trafico: 0,
      imei: 0,
      forense: 0,
      custodia: 0
    },
    totalTelefonos: 0
  });
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  // Funciones para manejar operaciones CRUD (placeholders)
  const handleEdit = (telefono: Telefono) => {
    toast.info(`Editar teléfono: ${telefono.numeroTelefonico}`);
    // Implementación real: Abrir modal de edición o navegar a página de edición
  };

  const handleDelete = (id: string) => {
    toast.info(`Eliminar teléfono ID: ${id}`);
    // Implementación real: Confirmar y eliminar teléfono
  };

  // Fetch de datos
  const fetchTelefonos = async (
    ruc?: string,
    proveedorId?: string,
    ubicacionId?: string,
    solicitud?: string
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (ruc && ruc.trim() !== '') {
        params.append('ruc', ruc.trim());
      }
      
      if (proveedorId && proveedorId !== 'all') {
        params.append('proveedorId', proveedorId);
      }
      
      if (ubicacionId && ubicacionId !== 'all') {
        params.append('ubicacionId', ubicacionId);
      }
      
      if (solicitud && solicitud !== 'all') {
        params.append('solicitud', solicitud);
      }

      const response = await fetch(`/api/telefonos-panel?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los datos de teléfonos');
      }
      
      const { data, estadisticas: estadisticasData, filtros, total } = await response.json();
      
      setTelefonos(data);
      setEstadisticas({
        porProveedor: estadisticasData.porProveedor,
        porUbicacion: estadisticasData.porUbicacion,
        solicitudes: estadisticasData.solicitudes,
        totalTelefonos: estadisticasData.totalTelefonos
      });
      setProveedores(filtros.proveedores);
      setUbicaciones(filtros.ubicaciones);
      setLastSearchParams({ 
        ruc: ruc?.trim() !== '' ? ruc?.trim() : undefined,
        proveedorId: proveedorId !== 'all' ? proveedorId : undefined,
        ubicacionId: ubicacionId !== 'all' ? ubicacionId : undefined,
        solicitud: solicitud !== 'all' ? solicitud : undefined
      });
      
      toast.success(`Se encontraron ${total} teléfonos`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de teléfonos');
      setTelefonos([]);
      setEstadisticas({
        porProveedor: [],
        porUbicacion: [],
        solicitudes: {
          trafico: 0,
          imei: 0,
          forense: 0,
          custodia: 0
        },
        totalTelefonos: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = () => {
    fetchTelefonos(
      rucBusqueda,
      proveedorSeleccionado,
      ubicacionSeleccionada,
      solicitudSeleccionada
    );
  };

  // Manejar actualización
  const handleRefresh = () => {
    if (lastSearchParams) {
      fetchTelefonos(
        lastSearchParams.ruc,
        lastSearchParams.proveedorId,
        lastSearchParams.ubicacionId,
        lastSearchParams.solicitud
      );
    } else {
      handleSearch();
    }
  };

  // Manejar limpieza de filtros
  const handleClearFilters = () => {
    setRucBusqueda('');
    setProveedorSeleccionado('all');
    setUbicacionSeleccionada('all');
    setSolicitudSeleccionada('all');
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchTelefonos();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Phone className="h-8 w-8" />
          Panel de Teléfonos y Medios de Comunicación
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Seleccione los criterios para visualizar la información de teléfonos y sus solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">RUC Causa</label>
              <Input
                placeholder="Buscar por RUC..."
                value={rucBusqueda}
                onChange={(e) => setRucBusqueda(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Proveedor</label>
              <Select
                value={proveedorSeleccionado}
                onValueChange={setProveedorSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ubicación</label>
              <Select
                value={ubicacionSeleccionada}
                onValueChange={setUbicacionSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {ubicaciones.map((ubicacion) => (
                    <SelectItem key={ubicacion.id} value={ubicacion.id.toString()}>
                      {ubicacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Solicitud</label>
              <Select
                value={solicitudSeleccionada}
                onValueChange={setSolicitudSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de solicitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las solicitudes</SelectItem>
                  <SelectItem value="trafico">Solicitud de Tráfico</SelectItem>
                  <SelectItem value="imei">Solicitud de IMEI</SelectItem>
                  <SelectItem value="forense">Extracción Forense</SelectItem>
                  <SelectItem value="custodia">Envío a Custodia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Limpiar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading || !lastSearchParams}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard de estadísticas */}
      <EstadisticasSection
        estadisticas={estadisticas}
        isLoading={isLoading}
      />
      
      {/* Tabla de teléfonos usando el componente existente */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Teléfonos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <TelefonosDataTable
              columns={columns}
              data={telefonos}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}