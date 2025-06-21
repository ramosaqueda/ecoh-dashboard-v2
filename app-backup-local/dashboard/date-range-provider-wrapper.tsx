'use client';

import { DateRangeProvider } from '@/components/DateRangeContext';
import React from 'react';

export function DateRangeProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return <DateRangeProvider>{children}</DateRangeProvider>;
}