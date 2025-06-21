'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
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
    label: 'ecoh',
    color: 'hsl(var(--chart-1))'
  },
  no_ecoh: {
    label: 'no_ecoh',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ejemplo gtrafico Stack</CardTitle>
        <CardDescription>
          Para mostrar la cantidad de causas ECOH y no ECOH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
          <AreaChart
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="no_ecoh"
              type="natural"
              fill="var(--color-no_ecoh)"
              fillOpacity={0.4}
              stroke="var(--color-no_ecoh)"
              stackId="a"
            />
            <Area
              dataKey="ecoh"
              type="natural"
              fill="var(--color-ecoh)"
              fillOpacity={0.4}
              stroke="var(--color-ecoh)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              incremento.... <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
