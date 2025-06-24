// hooks/useUserPermissions.ts
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
      if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
        setPermissions(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch('/api/usuarios/roles');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const users = await response.json();

        // Buscar el usuario actual en el array por email
        const currentUser = users.find((u: any) => 
          u.email === user.primaryEmailAddress?.emailAddress
        );

        if (!currentUser) {
          throw new Error('Usuario no encontrado');
        }

        const rolId = currentUser.rol.id;

        const newPermissions = {
          canCreate: rolId <= 2, // ADMIN (1) y Usuario (2)
          canEdit: rolId <= 4,   // ADMIN (1) y Usuario (2) y manager (4)
          canDelete: rolId === 1, // Solo ADMIN (1)
          canRead: true, // Todos
          isLoading: false
        };

        setPermissions(newPermissions);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setPermissions((prev) => ({ 
          ...prev, 
          isLoading: false,
          canCreate: false,
          canEdit: false,
          canDelete: false 
        }));
      }
    };

    fetchUserRole();
  }, [user?.id, user?.primaryEmailAddress?.emailAddress]);

  return permissions;
};