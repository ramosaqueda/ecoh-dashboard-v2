'use client';

import { useState, useEffect } from 'react';
import OrganizationNetworkReactFlow from '@/components/graph/organizationNetworkReactFlow';

interface NetworkPageProps {
  params: Promise<{ id: string }>; // ✅ Cambio: params es ahora Promise
}

export default function NetworkPage({ params }: NetworkPageProps) {
  // ✅ TODOS los hooks al inicio
  const [id, setId] = useState<string | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  // ✅ useEffect para resolver params Promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      setIsParamsLoaded(true);
    });
  }, [params]);

  // ✅ Loading state mientras se resuelven los params
  if (!isParamsLoaded || !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <OrganizationNetworkReactFlow organizationId={id} />
    </div>
  );
}