import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
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
        title: 'Tablero de actividades',
        href: '/dashboard/kanban',
        icon: 'kanban'
      }
    ]
  },


  {
    title: 'Actividades',
    icon: 'check',
    subItems: [
    
      {
        title: 'Gestión de Actividades',
        href: '/dashboard/actividades',
        icon: 'check'
      },
    
      {
        title: 'Actividades por Usuario',
        href: '/dashboard/todo',
        icon: 'UserRound'
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
    icon: 'report',
    label: 'reportes'
  },

  {
    title: 'Utiles',    
    icon: 'tool',
    label: 'utiles',
      subItems: [
        {
          title: 'Correlativos',
          href: '/dashboard/correlativos',
          icon: 'report',
          label: 'correlativos',
        },
        {
          title: 'LaunchPad',
          href: '/dashboard/LaunchpadECOH',
          icon: 'link2',
          label: 'reportes'
        },
        {
          title: 'Validar RUN',
          href: '/dashboard/validarut',
          icon: 'check',
          label: 'Validar RUN'
        }
        
      ]
  },
  
  
];
