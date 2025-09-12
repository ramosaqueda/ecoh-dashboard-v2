// components/notifications/ClientOnlyNotificationCenter.tsx - VERSIÓN FINAL

'use client';

import { useState, useEffect } from 'react';
import { NotificationCenter } from './NotificationCenter';

interface ClientOnlyNotificationCenterProps {
  userEmail: string;
  className?: string;
}

export function ClientOnlyNotificationCenter({ userEmail, className }: ClientOnlyNotificationCenterProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className={`rounded-lg p-1 backdrop-blur-sm bg-white/40 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/30 transition-all duration-200 hover:bg-white/60 dark:hover:bg-gray-800/60 ${className || ''}`}>
        <div className="h-8 w-8 flex items-center justify-center">
          <div className="h-5 w-5 animate-pulse bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return <NotificationCenter userEmail={userEmail} className={className} />;
}
