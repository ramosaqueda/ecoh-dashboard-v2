// Este sigue siendo un componente de servidor (sin 'use client')
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Metadata } from 'next';
import Header from '@/components/layout/header';
import { DateRangeProviderWrapper } from './date-range-provider-wrapper';

export const metadata: Metadata = {
  title: 'RGECOH',
  description: 'Registros y Gestión ECOH'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DateRangeProviderWrapper>
          {children}
        </DateRangeProviderWrapper>
      </main>
    </div>
  );
}