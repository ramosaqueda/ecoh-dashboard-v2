'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isUpdating: boolean;
  setIsUpdating: (state: boolean) => void;
  updateDashboard: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(currentYear, 0, 1), // January 1st of current year
    to: new Date() // Today
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const updateDashboard = () => {
    // This will trigger an update for all components
    setIsUpdating(true);
    // Allow components to react to the change
    setTimeout(() => setIsUpdating(false), 100);
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, isUpdating, setIsUpdating, updateDashboard }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}