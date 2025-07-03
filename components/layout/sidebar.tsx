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
import { Menu, ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Image from 'next/image';
import Link from 'next/link';

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const { isMinimized, toggle } = useSidebar();
  const { user } = useUser();

  // Debug logs
  console.log('Sidebar render - isMinimized:', isMinimized);

  const handleToggle = () => {
    console.log('Toggle clicked - current isMinimized:', isMinimized);
    toggle();
    console.log('Toggle called - new isMinimized should be:', !isMinimized);
  };

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
            
            {/* Acceso a Escritorio FN en mobile */}
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Acceso a Escritorio FN
              </h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 justify-start gap-3 px-3"
                  onClick={() => window.open('http://172.18.1.94/login/', '_blank')}
                >
                  <div className="relative h-6 w-6 flex-shrink-0 z-10">
                    <Image
                      src="/duo-mobile.png"
                      alt="Duo Mobile"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium text-gray-800 z-10">Acceso via DUO</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 justify-start gap-3 px-3"
                  onClick={() => window.open('http://172.18.1.94/EscritorioMP/login_cu.php', '_blank')}
                >
                  <div className="relative h-6 w-6 flex-shrink-0 z-10">
                    <Image
                      src="/clave-unica.png"
                      alt="Clave Única"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium text-gray-800 z-10">Clave Única</span>
                </Button>
              </div>
            </div>
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

              {/* Sección Acceso a Escritorio FN - EXPANDIDA */}
              {!isMinimized && (
                <div className="px-3 py-2">
                  <h2 className="mb-3 px-4 text-lg font-semibold tracking-tight">
                    Acceso a Escritorio FN
                  </h2>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full h-16 relative overflow-hidden bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border-green-200 justify-start gap-4 px-4"
                      onClick={() => window.open('http://172.18.1.94/login/', '_blank')}
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 z-10">
                        <Image
                          src="/duo-mobile.png"
                          alt="Duo Mobile"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-medium text-base text-gray-800 z-10">
                        Acceso via DUO
                      </span>
                      
                      {/* Imagen de fondo sutil */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-10">
                        <div className="relative h-12 w-12">
                          <Image
                            src="/duo-mobile.png"
                            alt=""
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-16 relative overflow-hidden bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-300 hover:to-blue-400 border-blue-200 justify-start gap-4 px-4"
                      onClick={() => window.open('http://172.18.1.94/EscritorioMP/login_cu.php', '_blank')}
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 z-10">
                        <Image
                          src="/clave-unica.png"
                          alt="Clave Única"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-medium text-base text-gray-800 z-10">
                        Clave Única
                      </span>
                      
                      {/* Imagen de fondo sutil */}
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-10">
                        <div className="relative h-12 w-12">
                          <Image
                            src="/clave-unica.png"
                            alt=""
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </Button>
                  </div>
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