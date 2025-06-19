// src/components/charts/MapaCalorIncidencia.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DelitoDistribucion {
  delitoId: number;
  delitoNombre: string;
  cantidad: number;
}

interface DatoTendencia {
  año: number;
  mes: number;
  comunaId: number;
  cantidad: number;
}

interface DatoComuna {
  id: number;
  nombre: string;
  cantidadCausas: number;
  distribucionDelitos: DelitoDistribucion[];
  tendenciaMensual: DatoTendencia[];
}

interface MapaCalorIncidenciaProps {
  datos: DatoComuna[];
  isLoading: boolean;
}

export default function MapaCalorIncidencia({ datos, isLoading }: MapaCalorIncidenciaProps) {
  const [colorIntensity, setColorIntensity] = useState<Record<number, string>>({});
  
  useEffect(() => {
    if (datos.length > 0) {
      // Encontrar el valor máximo para normalizar los colores
      const maxCausas = Math.max(...datos.map(d => d.cantidadCausas));
      
      // Crear mapa de intensidades de color
      const intensities: Record<number, string> = {};
      datos.forEach(comuna => {
        // Normalizar entre 0 y 1
        const normalizedValue = comuna.cantidadCausas / maxCausas;
        // Convertir a un color entre rojo claro y rojo oscuro
        const hue = 0; // rojo en HSL
        const saturation = 100; // saturación completa
        const lightness = Math.max(40, 100 - normalizedValue * 60); // entre 40% y 100% de luminosidad
        intensities[comuna.id] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      });
      
      setColorIntensity(intensities);
    }
  }, [datos]);

  // Función para obtener la clase de tamaño basada en la cantidad
  const getSizeClass = (cantidad: number): string => {
    const max = Math.max(...datos.map(d => d.cantidadCausas));
    const ratio = cantidad / max;
    
    if (ratio > 0.8) return 'text-2xl font-bold';
    if (ratio > 0.6) return 'text-xl font-semibold';
    if (ratio > 0.4) return 'text-lg font-medium';
    if (ratio > 0.2) return 'text-base';
    return 'text-sm';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapa de Calor por Comuna</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mapa">
          <TabsList className="mb-4">
            <TabsTrigger value="mapa">Mapa de Calor</TabsTrigger>
            <TabsTrigger value="tabla">Tabla Detallada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapa">
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : datos.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {datos.map(comuna => (
                  <div 
                    key={comuna.id}
                    className="p-4 rounded-md flex flex-col items-center justify-center text-center h-32"
                    style={{ backgroundColor: colorIntensity[comuna.id] || '#f8f8f8' }}
                  >
                    <div className={`${getSizeClass(comuna.cantidadCausas)}`}>
                      {comuna.nombre}
                    </div>
                    <div className="mt-2 font-bold">
                      {comuna.cantidadCausas} {comuna.cantidadCausas === 1 ? 'causa' : 'causas'}
                    </div>
                    {comuna.distribucionDelitos.length > 0 && (
                      <div className="text-xs mt-1 opacity-80">
                        {comuna.distribucionDelitos[0].delitoNombre}: {comuna.distribucionDelitos[0].cantidad}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tabla">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : datos.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay datos disponibles para los filtros seleccionados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Comuna</th>
                      <th className="border p-2 text-center">Total Causas</th>
                      <th className="border p-2 text-left">Delito Principal</th>
                      <th className="border p-2 text-left">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map(comuna => (
                      <tr key={comuna.id} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">{comuna.nombre}</td>
                        <td className="border p-2 text-center">{comuna.cantidadCausas}</td>
                        <td className="border p-2">
                          {comuna.distribucionDelitos.length > 0 
                            ? comuna.distribucionDelitos[0].delitoNombre 
                            : 'No disponible'}
                        </td>
                        <td className="border p-2">
                          <div className="space-y-1">
                            {comuna.distribucionDelitos.slice(0, 3).map(delito => (
                              <div key={delito.delitoId} className="flex justify-between text-sm">
                                <span>{delito.delitoNombre}</span>
                                <span className="font-medium">{delito.cantidad}</span>
                              </div>
                            ))}
                            {comuna.distribucionDelitos.length > 3 && (
                              <div className="text-xs text-gray-500 italic">
                                Y {comuna.distribucionDelitos.length - 3} delitos más...
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}