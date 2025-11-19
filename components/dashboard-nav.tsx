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
import { Separator } from './ui/separator';

// Mapeo de colores a clases de Tailwind
const colorClasses = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
    active: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    border: 'border-l-4 border-blue-500'
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    hover: 'hover:bg-green-50 dark:hover:bg-green-950/30',
    active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    border: 'border-l-4 border-green-500'
  },
  orange: {
    icon: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    hover: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
    active: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    border: 'border-l-4 border-orange-500'
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-950/30',
    active: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    border: 'border-l-4 border-purple-500'
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    border: 'border-l-4 border-emerald-500'
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    hover: 'hover:bg-teal-50 dark:hover:bg-teal-950/30',
    active: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    border: 'border-l-4 border-teal-500'
  },
  red: {
    icon: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    hover: 'hover:bg-red-50 dark:hover:bg-red-950/30',
    active: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    border: 'border-l-4 border-red-500'
  },
  cyan: {
    icon: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/30',
    active: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
    border: 'border-l-4 border-cyan-500'
  },
  indigo: {
    icon: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
    active: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    border: 'border-l-4 border-indigo-500'
  },
  gray: {
    icon: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-950/30',
    active: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300',
    border: 'border-l-4 border-gray-500'
  }
};

interface NavItemProps {
  item: NavItem;
  isMinimized: boolean;
  depth?: number;
  onOpenChange?: () => void;
  parentColor?: NavItem['color'];
}

const NavItemComponent = ({
  item,
  isMinimized,
  depth = 0,
  onOpenChange,
  parentColor
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

  // Usar el color del item o heredar del padre
  const itemColor = item.color || parentColor || 'gray';
  const colors = colorClasses[itemColor];

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
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          depth === 0 && colors.icon,
          depth > 0 && "text-muted-foreground"
        )} />
        {(!isMinimized || depth > 0) && (
          <span className={cn(
            "flex-1 truncate text-sm font-medium transition-colors",
            depth === 0 && "font-semibold"
          )}>
            {item.title}
          </span>
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
            'flex w-full items-center rounded-lg px-3 py-2.5 transition-all duration-200',
            colors.hover,
            isActive && colors.active,
            isActive && depth === 0 && colors.border,
            item.disabled && 'pointer-events-none opacity-60',
            depth > 0 && 'ml-4 py-2'
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
          'w-full justify-start rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-transparent',
          colors.hover,
          (isActive || isSubItemActive) && colors.bg,
          (isActive || isSubItemActive) && depth === 0 && colors.border,
          depth > 0 && 'ml-4 py-2'
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
        <div className="mt-1 space-y-1 pl-2">
          {item.subItems?.map((subItem, index) => (
            <NavItemComponent
              key={subItem.href || index}
              item={subItem}
              depth={depth + 1}
              isMinimized={isMinimized}
              onOpenChange={onOpenChange}
              parentColor={itemColor}
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
  isMinimized?: boolean;
  className?: string;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
  isMinimized: propIsMinimized,
  className
}: DashboardNavProps) {
  const { isMinimized: hookIsMinimized } = useSidebar();
  
  const isMinimized = propIsMinimized !== undefined ? propIsMinimized : (!isMobileNav && hookIsMinimized);

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn("grid items-start gap-1", className)}>
      <TooltipProvider>
        {items.map((item, index) => (
          <div key={item.href || index}>
            <NavItemComponent
              item={item}
              isMinimized={isMinimized}
              onOpenChange={() => setOpen?.(false)}
            />
            {/* Separador visual entre secciones principales */}
            {index < items.length - 1 && !isMinimized && (
              <Separator className="my-3" />
            )}
          </div>
        ))}
      </TooltipProvider>
    </nav>
  );
}