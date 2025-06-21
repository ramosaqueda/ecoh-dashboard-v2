'use client';

import React, { createContext, useContext, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 

// Context para el año seleccionado
const YearContext = createContext<{
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  updateDashboard: () => void;
}>({
  selectedYear: new Date().getFullYear().toString(),
  setSelectedYear: () => {},
  updateDashboard: () => {}
});

export const useYearContext = () => useContext(YearContext);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  const updateDashboard = () => {
    setTriggerUpdate(prev => prev + 1);
  };

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, updateDashboard }}>
      {children}
    </YearContext.Provider>
  );
}

export function YearSelector() {
  const { selectedYear, setSelectedYear, updateDashboard } = useYearContext();
  
  const years = [
    "todos", // Añadimos la opción "todos"
    ...Array.from(
      { length: 5 },
      (_, i) => (new Date().getFullYear() - i).toString()
    )
  ];

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year === "todos" ? "Todos" : year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

    </div>
  );
}