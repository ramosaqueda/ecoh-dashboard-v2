import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface CommandStats {
  actividadesPendientes: number;
  notificacionesNoLeidas: number;
  causasActivas: number;
  isLoading: boolean;
}

export function useCommandStats() {
  const { userId, isLoaded } = useAuth();
  const [stats, setStats] = useState<CommandStats>({
    actividadesPendientes: 0,
    notificacionesNoLeidas: 0,
    causasActivas: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!isLoaded || !userId) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            actividadesPendientes: data.actividadesPendientes || 0,
            notificacionesNoLeidas: data.notificacionesNoLeidas || 0,
            causasActivas: data.causasActivas || 0,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching command stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, [userId, isLoaded]);

  return stats;
}
