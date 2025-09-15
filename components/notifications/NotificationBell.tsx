// /components/notifications/NotificationBell.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from './NotificationCenter';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const { unreadCount, isOpen, setIsOpen } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Animar cuando hay nuevas notificaciones
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={bellRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleNotifications}
        className={cn(
          "relative p-2 transition-all duration-200",
          isAnimating && "animate-bounce",
          isOpen && "bg-gray-100"
        )}
      >
        <Bell className={cn(
          "h-5 w-5 transition-colors",
          unreadCount > 0 ? "text-blue-600" : "text-gray-600",
          isAnimating && "animate-pulse"
        )} />
        
        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-all duration-200",
            isAnimating && "animate-ping"
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Indicador de actividad */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75" />
        )}
      </Button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
