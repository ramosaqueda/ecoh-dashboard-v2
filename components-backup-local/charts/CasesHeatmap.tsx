'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useYearContext } from '@/components/YearSelector';

interface DayData {
  date: string;
  count: number;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function CasesHeatmap() {
  const { selectedYear } = useYearContext();
  const [data, setData] = useState<DayData[]>([]);
  const [weekdayStats, setWeekdayStats] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Construir URL para la API
        const url = new URL('/api/analytics/cases-heatmap', window.location.origin);
        
        // Solo añadir year si no es "todos"
        if (selectedYear !== 'todos') {
          url.searchParams.append('year', selectedYear);
        }
        
        const response = await fetch(url.toString());
        const fetchedData = await response.json();
        setData(fetchedData);
        
        // Calcular estadísticas por día de la semana
        const weekdayCounts: {[key: string]: number} = {};
        fetchedData.forEach((day: DayData) => {
          const date = new Date(day.date);
          const weekday = DAYS[date.getDay()];
          weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + day.count;
        });
        setWeekdayStats(weekdayCounts);
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const getColor = (count: number) => {
    const max = Math.max(...data.map((d) => d.count));
    if (max === 0) return 'rgb(254, 242, 242)';

    const intensity = count / max;

    if (intensity === 0) return 'rgb(254, 242, 242)'; // rose-50
    if (intensity <= 0.2) return 'rgb(254, 205, 211)'; // rose-200
    if (intensity <= 0.4) return 'rgb(251, 155, 171)'; // rose-300
    if (intensity <= 0.6) return 'rgb(244, 114, 140)'; // rose-400
    if (intensity <= 0.8) return 'rgb(236, 72, 107)'; // rose-500
    return 'rgb(225, 29, 72)'; // rose-600
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekdayHighlight = (weekday: string) => {
    const maxWeekday = Math.max(...Object.values(weekdayStats));
    const count = weekdayStats[weekday] || 0;
    return count === maxWeekday ? 'font-bold text-rose-600' : '';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Intensidad de Casos por Día</CardTitle>
        <div className="text-sm text-muted-foreground">
          {selectedYear === 'todos' ? 'Todos los años' : `Año: ${selectedYear}`}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {/* Calendar header with months */}
              <div className="flex">
                <div className="w-8" /> {/* Espacio para los días */}
                <div className="flex flex-1">
                  {MONTHS.map((month) => (
                    <div
                      key={month}
                      className="flex-1 text-center text-xs text-muted-foreground"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Calendar body */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex">
                  <div 
                    className={`w-8 text-xs ${getWeekdayHighlight(day)}`}
                    title={`${day}: ${weekdayStats[day] || 0} casos totales`}
                  >
                    {day}
                  </div>
                  <div className="flex flex-1 gap-1">
                    {data
                      .filter(item => new Date(item.date).getDay() === dayIndex)
                      .map((dayData, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 rounded-sm transition-all hover:ring-2 hover:ring-rose-500 hover:ring-offset-2"
                          style={{ backgroundColor: getColor(dayData.count) }}
                          title={`${formatDate(dayData.date)}: ${dayData.count} casos`}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="text-sm font-medium">
                  Total: {data.reduce((sum, day) => sum + day.count, 0)} casos
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-sm bg-rose-100" />
                    Menos
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-sm bg-rose-600" />
                    Más
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.entries(weekdayStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([day, count], index) => (
                    <span key={day} className={index === 0 ? 'font-medium text-rose-600' : ''}>
                      {day}: {count} casos{index < Object.keys(weekdayStats).length - 1 ? ' | ' : ''}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CasesHeatmap;