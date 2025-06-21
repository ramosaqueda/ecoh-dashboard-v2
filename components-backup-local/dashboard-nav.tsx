'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';
import { Button } from './ui/button';

interface NavItemProps {
  item: NavItem;
  isMinimized: boolean;
  depth?: number;
  onOpenChange?: () => void;
}

const NavItemComponent = ({
  item,
  isMinimized,
  depth = 0,
  onOpenChange
}: NavItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const IconComponent = item.icon && Icons[item.icon];
  const Icon = IconComponent || Icons.arrowRight;
  const isActive = item.href ? pathname === item.href : false;
  const isSubItemActive = item.subItems?.some(
    (subItem) => subItem.href === pathname
  );

  const handleClick = () => {
    if (hasSubItems) {
      setIsExpanded(!isExpanded);
    } else if (onOpenChange) {
      onOpenChange();
    }
  };

  const navContent = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon className="h-5 w-5 flex-shrink-0" />
        {(!isMinimized || depth > 0) && (
          <span className="flex-1 truncate text-sm">{item.title}</span>
        )}
        {hasSubItems && !isMinimized && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
    </>
  );

  const renderContent = () => {
    if (item.href && !hasSubItems) {
      return (
        <Link
          href={item.disabled ? '#' : item.href}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground',
            item.disabled && 'pointer-events-none opacity-60',
            depth > 0 && 'ml-4'
          )}
          onClick={onOpenChange}
        >
          {navContent}
        </Link>
      );
    }

    return (
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground',
          (isActive || isSubItemActive) && 'bg-accent text-accent-foreground',
          depth > 0 && 'ml-4'
        )}
        onClick={handleClick}
      >
        {navContent}
      </Button>
    );
  };

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>{renderContent()}</TooltipTrigger>
        {isMinimized && depth === 0 && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.title}
            {hasSubItems && <ChevronRight className="h-4 w-4" />}
          </TooltipContent>
        )}
      </Tooltip>

      {hasSubItems && isExpanded && !isMinimized && (
        <div className="mt-1 space-y-1">
        {item.subItems?.map((subItem, index) => (
          <NavItemComponent
            key={subItem.href || index}
            item={subItem}
            depth={depth + 1}
            isMinimized={isMinimized}
            onOpenChange={onOpenChange}
          />
        ))}
      </div>
      )}
    </div>
  );
};

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
  isMinimized?: boolean; // ← Agregar esta prop
  className?: string;     // ← Agregar esta prop también
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
  isMinimized: propIsMinimized, // ← Renombrar para evitar conflicto
  className
}: DashboardNavProps) {
  const { isMinimized: hookIsMinimized } = useSidebar();
  
  // Usar la prop si se pasa, sino usar el hook
  const isMinimized = propIsMinimized !== undefined ? propIsMinimized : (!isMobileNav && hookIsMinimized);

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn("grid items-start gap-2", className)}>
      <TooltipProvider>
        {items.map((item, index) => (
          <NavItemComponent
            key={item.href || index}
            item={item}
            isMinimized={isMinimized}
            onOpenChange={() => setOpen?.(false)}
          />
        ))}
      </TooltipProvider>
    </nav>
  );
}