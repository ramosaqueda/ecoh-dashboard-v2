// src/components/charts/GraficoTendencia.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DatoTendencia {
  año: number;
  mes: number;
  comunaId: number;
  cantidad: number;
}

// ✅ Interfaz extendida para incluir el nombre de la comuna
interface DatoTendenciaConNombre extends DatoTendencia {
  comunaNombre: string;
}

interface DatoComuna {
  id: number;
  nombre: string;
  cantidadCausas: number;
  distribucionDelitos: any[];
  tendenciaMensual: DatoTendencia[];
}

interface GraficoTendenciaProps {
  datos: DatoComuna[];
  isLoading: boolean;
}

// ✅ Interfaz para los datos procesados del gráfico
interface DatoProcesado {
  fecha: string;
  mes: string;
  año: number;
  [key: string]: string | number; // Para las propiedades dinámicas como "comuna-1", "nombre-1", etc.
}

// ✅ Interfaz para el tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

// Colores para las diferentes líneas del gráfico
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', 
  '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'
];

// Nombres de los meses
const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function GraficoTendencia({ datos, isLoading }: GraficoTendenciaProps) {
  // Procesar datos para el gráfico
  const datosProcesados = useMemo((): DatoProcesado[] => {
    // Obtener todas las tendencias mensuales con nombre de comuna
    const todasTendencias: DatoTendenciaConNombre[] = [];
    datos.forEach(comuna => {
      comuna.tendenciaMensual.forEach(tendencia => {
        // ✅ Crear objeto con tipo DatoTendenciaConNombre
        const tendenciaConNombre: DatoTendenciaConNombre = {
          ...tendencia,
          comunaNombre: comuna.nombre
        };
        todasTendencias.push(tendenciaConNombre);
      });
    });
    
    // Agrupar por año-mes
    const agrupados: Record<string, DatoProcesado> = {};
    todasTendencias.forEach(tendencia => {
      const key = `${tendencia.año}-${tendencia.mes}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          fecha: key,
          mes: MESES[tendencia.mes - 1],
          año: tendencia.año,
        };
      }
      
      // Agregar dato de comuna
      agrupados[key][`comuna-${tendencia.comunaId}`] = tendencia.cantidad;
      agrupados[key][`nombre-${tendencia.comunaId}`] = tendencia.comunaNombre;
    });
    
    // Convertir a array y ordenar por fecha
    return Object.values(agrupados).sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return parseInt(a.mes) - parseInt(b.mes);
    });
  }, [datos]);

  // Filtrar comunas con datos suficientes (al menos 3 puntos de datos)
  const comunasConDatos = useMemo((): DatoComuna[] => {
    const conteo: Record<number, number> = {};
    
    datos.forEach(comuna => {
      conteo[comuna.id] = comuna.tendenciaMensual.length;
    });
    
    return datos
      .filter(comuna => (conteo[comuna.id] || 0) >= 2)
      .slice(0, 6); // Limitar a 6 comunas para legibilidad
  }, [datos]);

  // Personalizar el tooltip del gráfico
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <div className="mt-2">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3" style={{ backgroundColor: entry.color }}></div>
                <span>{entry.name}: </span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: string): string => {
    const [año, mes] = tickItem.split('-');
    return `${MESES[parseInt(mes) - 1]} ${año}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolución Temporal por Comuna</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : comunasConDatos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No hay suficientes datos temporales para mostrar tendencias.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={datosProcesados}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  tickFormatter={formatXAxis} 
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {comunasConDatos.map((comuna, index) => (
                  <Line
                    key={comuna.id}
                    type="monotone"
                    dataKey={`comuna-${comuna.id}`}
                    name={comuna.nombre}
                    stroke={COLORS[index % COLORS.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}