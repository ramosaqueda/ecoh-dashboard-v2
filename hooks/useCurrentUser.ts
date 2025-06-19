// hooks/useCurrentUser.ts
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Usuario } from '@prisma/client';

export const useCurrentUser = () => {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/usuarios/${user.id}`);
        if (!response.ok) throw new Error('Error al obtener usuario');
        const data = await response.json();
        setDbUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user, clerkLoaded]);

  return {
    user: dbUser,
    isLoading: isLoading || !clerkLoaded,
    error
  };
};
