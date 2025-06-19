import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Paneles',
    icon: 'panelleft',
    subItems: [
      {
        title: 'Resumen Formalizaciones',
        href: '/dashboard/ResumenFormalizaciones',
        icon: 'lawyer',
        label: 'causas'
      },
      {
        title: 'Actividades',
        href: '/dashboard/seguimiento-actividades',
        icon: 'squerecheck'
      },
      {
        title: 'Incidencia Geográfica',
        href: '/dashboard/incidencia-geografica',
        icon: 'mappin'
      },
      {
        title: 'Telefonos Panel',
        href: '/dashboard/telefonos-panel',
        icon: 'phonecall'
      }
    ]
  },
  {
    title: 'Gestión de Causas',
    icon: 'folder',
    subItems: [
      {
        title: 'Causas',
        href: '/dashboard/causas',
        icon: 'briefcase',
        label: 'causas'
      },
      {
        title: 'Actividades',
        href: '/dashboard/actividades',
        icon: 'check'
      },
      {
        title: 'Tablero',
        href: '/dashboard/kanban',
        icon: 'kanban'
      }
    ]
  },

  {
    title: 'Imputados o Sujetos de interés',
    href: '/dashboard/imputado',
    icon: 'ghost',
    label: 'imputados'
  },

  {
    title: 'Victimas',
    href: '/dashboard/victima',
    icon: 'UserRound',
    label: 'victima'
  },

  {
    title: 'Mapas Delitos',
    href: '/dashboard/geo',
    icon: 'map',
    label: 'Mapas'
  },
  
  {
    title: 'Genogramas',
    href: '/dashboard/genograma',
    icon: 'Waipoints',
    label: 'Genogramas'
  },
  {
    title: 'Registro Organizaciones',
    icon: 'Net',
    subItems: [
      {
        title: 'Gestion organizaciones',
        href: '/dashboard/organizacion',
        icon: 'page'
      },
      {
        title: 'Network',
        href: '/dashboard/oc-networkgraph',
        icon: 'Share'
      }
    ]
  },
  {
    title: 'Telefonos',
    icon: 'Smartphone',
    label: 'Telefonos',
    subItems: [
      {
        title: 'Gestión de Telefonos',
        href: '/dashboard/telefonos',
        icon: 'Smartphone'
      },
      {
        title: 'Grafo de Telefonos',
        href: '/dashboard/telefonos/grafo',
        icon: 'Share'
      }
    ]
  },
  {
    title: 'Reportes',
    href: '/dashboard/reportes',
    icon: 'reporte',
    label: 'reporte'
  },
  {
    title: 'Login',
    href: '/',
    icon: 'login',
    label: 'login'
  }
];
