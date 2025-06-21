// app/dashboard/reportes/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes | Sistema ECOH',
  description: 'Reportes y análisis estadístico del sistema',
};

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}