'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useYearContext } from '@/components/YearSelector';

interface NationalityData {
  name: string;
  value: number;
  color: string;
}

const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde agua
  '#FFBB28', // Amarillo
  '#FF8042', // Naranja
  '#8884d8', // Púrpura
  '#82ca9d', // Verde claro
  '#ffc658', // Amarillo claro
  '#ff8a65', // Coral
  '#ba68c8', // Violeta
  '#4db6ac' // Turquesa
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalValue = payload[0].payload.totalValue;
    const percentage = ((data.value / totalValue) * 100).toFixed(1);

    return (
      <div className="rounded-lg border bg-white p-2 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">
          <span className="font-semibold">{data.value}</span> imputados
        </p>
        <p className="text-xs text-muted-foreground">{percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function NationalityDistribution() {
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<NationalityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics/nationality-distribution?year=${selectedYear}`);
        if (!response.ok) throw new Error('Error al cargar datos');

        const rawData = await response.json();

        // Calcular el total
        const total = (Object.values(rawData) as number[]).reduce(
          (a: number, b: number) => a + b,
          0
        );

        // Procesar y ordenar datos
        const processedData = Object.entries(rawData)
          .map(([name, count]: [string, any], index) => ({
            name,
            value: count,
            color: COLORS[index % COLORS.length],
            totalValue: total // Añadir el total a cada elemento
          }))
          .sort((a, b) => b.value - a.value);

        setData(processedData);
      } catch (error) {
        console.error('Error fetching nationality distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]); // Añadimos selectedYear como dependencia

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Distribución por Nacionalidad</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({selectedYear})
            </span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {data.reduce((acc, curr) => acc + curr.value, 0)} imputados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? '#fff' : 'transparent'}
                      strokeWidth={2}
                      style={{
                        filter:
                          activeIndex === index
                            ? 'drop-shadow(0 0 8px rgba(0,0,0,0.2))'
                            : 'none',
                        transform:
                          activeIndex === index ? 'scale(1.1)' : 'scale(1)',
                        transformOrigin: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value: string) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}