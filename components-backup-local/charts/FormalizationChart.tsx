'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import DelitoSelect from '@/components/select/DelitoSelect';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const FormalizationChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelito, setSelectedDelito] = useState('');
  const [onlyEcoh, setOnlyEcoh] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDelito) {
        params.append('delitoId', selectedDelito);
      }
      if (onlyEcoh) {
        params.append('ecoh', 'true');
      }

      const response = await fetch(`/api/analytics/formalizaciones?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar datos');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDelito, onlyEcoh]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-white p-2 shadow-sm">
          <p className="font-medium">Año {label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              Formalizados: <span className="font-medium">{payload[0].value}</span>
            </p>
            <p className="text-sm">
              Con Medida Cautelar: <span className="font-medium">{payload[1].value}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Porcentaje con Medida: {' '}
              <span className="font-medium">
                {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-xl font-bold">
            Análisis de Formalizaciones y Medidas Cautelares por Año
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-64">
              <DelitoSelect
                value={selectedDelito}
                onValueChange={setSelectedDelito}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ecoh-mode"
                checked={onlyEcoh}
                onCheckedChange={setOnlyEcoh}
              />
              <Label htmlFor="ecoh-mode">Solo causas ECOH</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-xs"
                  label={{ 
                    value: 'Año', 
                    position: 'insideBottom', 
                    offset: -5 
                  }}
                />
                <YAxis 
                  className="text-xs"
                  label={{ 
                    value: 'Cantidad de Sujetos', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="formalizados"
                  fill="#3b82f6"
                  name="Total Formalizados"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="conMedida"
                  fill="#22c55e"
                  name="Con Medida Cautelar"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormalizationChart;