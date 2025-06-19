// components/timeline/TimelineNav.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelineNavProps {
  dates: string[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

export default function TimelineNav({ dates, onSelectDate, selectedDate }: TimelineNavProps) {
  const [timeGroups, setTimeGroups] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const groups: Record<string, string[]> = {};
    
    // Group dates by year
    dates.forEach(date => {
      const year = new Date(date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      
      // Solo añade la fecha si no existe ya en el arreglo
      if (!groups[year].includes(date)) {
        groups[year].push(date);
      }
    });
    
    setTimeGroups(groups);
  }, [dates]);
  
  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10 py-2">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 overflow-x-auto min-w-max">
          {Object.entries(timeGroups).sort(([yearA], [yearB]) => 
            parseInt(yearA) - parseInt(yearB)
          ).map(([year, yearDates]) => (
            <div key={year} className="flex flex-col gap-1 shrink-0">
              <div className="font-medium text-sm">{year}</div>
              <div className="flex gap-1">
                {yearDates.sort((a, b) => 
                  new Date(a).getTime() - new Date(b).getTime()
                ).map((date, index) => {
                  const dateObj = new Date(date);
                  const month = dateObj.toLocaleString('es-CL', { month: 'short' });
                  const day = dateObj.getDate();
                  
                  const isSelected = selectedDate === date;
                  
                  // Usa una combinación de fecha e índice como clave única
                  return (
                    <Button
                      key={`${date}-${index}`}
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className="text-xs shrink-0"
                      onClick={() => onSelectDate(date)}
                    >
                      {day} {month}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}