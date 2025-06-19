'use client';
import OrganizationNetworkGraph from '@/components/graph/OrganizationNetworkGraph';
 
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Grafo Org. Criminal', link: '/dashboard/oc-networkgraph' }
];
export default function OrganizacionesPage() {
  return (
    <PageContainer scrollable={true}>
      <div className="container mx-auto p-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mb-4 text-2xl font-bold">
          Red de Organizaciones Delictuales
        </h1>
        <OrganizationNetworkGraph />
      </div>
    </PageContainer>
  );
}
