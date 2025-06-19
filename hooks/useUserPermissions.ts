// hooks/useUserPermissions.ts (igual que antes)
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRead: boolean;
  isLoading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canRead: true,
    isLoading: true
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/usuarios/roles');
        const data = await response.json();

        const rolId = data.rolId;
        setPermissions({
          canCreate: rolId <= 2, // ADMIN y WRITE
          canEdit: rolId <= 2, // ADMIN y WRITE
          canDelete: rolId === 1, // Solo ADMIN
          canRead: true, // Todos
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
        setPermissions((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return permissions;
};
