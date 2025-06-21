// app/dashboard/organizacion/page.tsx
import { Metadata } from 'next';
import OrganizationDashboard from '@/components/dashboard/OrganizationDashboard';

export const metadata: Metadata = {
  title: 'Gestión de Organizaciones | ECOH Dashboard',
  description: 'Gestión y seguimiento de organizaciones delictuales'
};

export default function OrganizacionPage() {
  return (
    <main className="container mx-auto py-6">
      {/* ✅ No pasar props de función */}
      <OrganizationDashboard />
    </main>
  );
}