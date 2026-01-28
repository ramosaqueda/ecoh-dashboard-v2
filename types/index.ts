import { Icons } from '@/components/icons';

export type NavItem = {
  title: string;
  href?: string;
  icon?: keyof typeof Icons;
  label?: string;
  disabled?: boolean;
  subItems?: NavItem[];
  isExpanded?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'emerald' | 'teal' | 'red' | 'cyan' | 'indigo' | 'violet' | 'gray';
};

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;