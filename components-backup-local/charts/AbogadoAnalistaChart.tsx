'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface UserData {
  name: string;
  count: number;
}

// Paleta moderna para abogados
const LAWYER_COLORS = {
  fill: '#06b6d4', // Cyanb-500
  hover: '#0891b2', // Cyan-600
  background: '#cffafe' // Cyan-100
};

// Paleta moderna para analistas
const ANALYST_COLORS = {
  fill: '#14b8a6', // Teal-500
  hover: '#0d9488', // Teal-600
  background: '#ccfbf1' // Teal-100
};

export default function AbogadoAnalistaChart() {
  const [lawyers, setLawyers] = useState<UserData[]>([]);
  const [analysts, setAnalysts] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [lawyersResponse, analystsResponse] = await Promise.all([
          fetch('/api/analytics/causas-abogado'),
          fetch('/api/analytics/causas-analista')
        ]);

        if (!lawyersResponse.ok || !analystsResponse.ok) {
          throw new Error('Error al cargar datos');
        }

        const lawyersData = await lawyersResponse.json();
        const analystsData = await analystsResponse.json();

        setLawyers(lawyersData);
        setAnalysts(analystsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-semibold">{payload[0].value}</span> causas
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartContent = ({
    data,
    type
  }: {
    data: UserData[];
    type: 'lawyers' | 'analysts';
  }) => {
    const colors = type === 'lawyers' ? LAWYER_COLORS : ANALYST_COLORS;

    return (
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.background} />
            <XAxis type="number" tick={{ fill: '#6b7280' }} />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill={colors.fill}
              background={{ fill: colors.background }}
              animationDuration={1000}
              radius={[0, 10, 10, 0]} // Añadido: redondea las esquinas derechas
              onMouseOver={(data, index) => {
                document
                  .querySelector(`path[index="${index}"]`)
                  ?.setAttribute('fill', colors.hover);
              }}
              onMouseOut={(data, index) => {
                document
                  .querySelector(`path[index="${index}"]`)
                  ?.setAttribute('fill', colors.fill);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Causas por Equipo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="lawyers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="lawyers"
                className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
              >
                Abogados
              </TabsTrigger>
              <TabsTrigger
                value="analysts"
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
              >
                Analistas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="lawyers">
              <ChartContent data={lawyers} type="lawyers" />
            </TabsContent>
            <TabsContent value="analysts">
              <ChartContent data={analysts} type="analysts" />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
