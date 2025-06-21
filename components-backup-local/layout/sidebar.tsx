'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Menu, ChevronLeft, Users } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const { isMinimized, toggle } = useSidebar();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  // Debug logs
  console.log('Sidebar render - isMinimized:', isMinimized);

  const handleToggle = () => {
    console.log('Toggle clicked - current isMinimized:', isMinimized);
    toggle();
    console.log('Toggle called - new isMinimized should be:', !isMinimized);
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/usuarios/me');
          const userData = await response.json();
          setIsAdmin(userData.rol === 'ADMIN');
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <>
      {/* Mobile Sidebar using Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ScrollArea className="h-full px-2">
            <div className="p-5 pt-8">
              <Link href="#">
                <h1>Sidebar</h1>
              </Link>
            </div>
            <DashboardNav items={navItems} isMobileNav={true} />
            {isAdmin && (
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Administración
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/users/sync"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    <Users className="h-4 w-4" />
                    Sincronizar Usuarios
                  </Link>
                </div>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="relative">
        {/* Toggle Button - Posición ajustada para evitar traslape */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'fixed top-20 z-50 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent transition-all duration-300',
            isMinimized ? 'left-[60px] rotate-180' : 'left-[276px] rotate-0'
          )}
          onClick={handleToggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <aside
          className={cn(
            'fixed left-0 z-20 flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out md:relative',
            isMinimized ? 'w-[72px]' : 'w-72',
            className
          )}
        >
        {/* Header with Logo */}
        <div className="flex h-16 items-center px-4">
          <div
            className={cn(
              'w-full transition-all duration-300 ease-in-out',
              isMinimized ? 'opacity-0' : 'opacity-100'
            )}
          >
            {!isMinimized && (
             <p className="text-xs text-gray-900 dark:text-white">ECOH/SACFI</p>

            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="flex flex-col gap-2">
            <DashboardNav
              items={navItems}
              isMinimized={isMinimized}
              className={cn(
                'transition-all duration-300 ease-in-out',
                isMinimized ? 'items-center' : ''
              )}
            />
            
            {/* Admin Section */}
            {isAdmin && !isMinimized && (
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Administración
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/users/sync"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  >
                    <Users className="h-4 w-4" />
                    <span>Sincronizar Usuarios</span>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Admin Section for minimized state */}
            {isAdmin && isMinimized && (
              <div className="px-3 py-2">
                <Link
                  href="/admin/users/sync"
                  className="flex justify-center rounded-lg py-2 text-gray-600 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <Users className="h-4 w-4" />
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* User Profile Section */}
        <div
          className={cn(
            'border-t p-4 transition-all duration-300 ease-in-out',
            isMinimized ? 'items-center' : ''
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div
              className={cn(
                'flex flex-col transition-all duration-300 ease-in-out',
                isMinimized ? 'w-0 opacity-0' : 'w-auto opacity-100'
              )}
            >
              <span className="truncate text-sm font-medium">
                {user?.username || 'Usuario'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress || 'email@example.com'}
              </span>
            </div>
          </div>
        </div>
              </aside>
      </div>
    </>
  );
};

export default Sidebar;