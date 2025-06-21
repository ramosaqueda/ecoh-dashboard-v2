'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'GRAFICO INTERACTIVO DE BARRAS';

const chartData = [
  { mes: 'ene', ecoh: 0, no_ecoh: 6 },
  { mes: 'feb', ecoh: 3, no_ecoh: 5 },
  { mes: 'mar', ecoh: 6, no_ecoh: 3 },
  { mes: 'abr', ecoh: 6, no_ecoh: 5 },
  { mes: 'may', ecoh: 2, no_ecoh: 4 },
  { mes: 'jun', ecoh: 8, no_ecoh: 1 },
  { mes: 'jul', ecoh: 8, no_ecoh: 0 },
  { mes: 'ago', ecoh: 8, no_ecoh: 1 },
  { mes: 'sep', ecoh: 7, no_ecoh: 2 },
  { mes: 'oct', ecoh: 11, no_ecoh: 1 },
  { mes: 'nov', ecoh: 4, no_ecoh: 0 },
  { mes: 'dic', ecoh: 2, no_ecoh: 3 }
];

const chartConfig = {
  ecoh: {
    label: 'Causa ECOH',
    color: 'hsl(var(--chart-1))'
  },
  no_ecoh: {
    label: 'Causa no ECOH',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('ecoh');

  const total = React.useMemo(
    () => ({
      ecoh: chartData.reduce((acc, curr) => acc + curr.ecoh, 0),
      no_ecoh: chartData.reduce((acc, curr) => acc + curr.no_ecoh, 0)
    }),
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Ingresos</CardTitle>
          <CardDescription>2024</CardDescription>
        </div>
        <div className="flex">
          {['ecoh', 'no_ecoh'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total]}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[150px]" nameKey="mes" />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
