// utils/withAdminProtection.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function withAdminProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isLoaded, user } = useUser();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      async function checkAdmin() {
        try {
          const response = await fetch('/api/admin/check-role');
          if (!response.ok) {
            router.push('/');
          } else {
            setIsAuthorized(true);
          }
        } catch (error) {
          console.error('Error verificando rol:', error);
          router.push('/');
        }
      }

      if (isLoaded && user) {
        checkAdmin();
      }
    }, [isLoaded, user, router]);

    if (!isLoaded || !isAuthorized) {
      return <div>Cargando...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
