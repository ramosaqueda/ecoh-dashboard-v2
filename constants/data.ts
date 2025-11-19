import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    color: 'blue' // Azul para inicio
  },
  
  {
    title: 'Gestión de Causas',
    icon: 'folder',
    color: 'blue', // Azul para gestión
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
    color: 'green', // Verde para actividades/tareas
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
    label: 'imputados',
    color: 'orange' // Naranja para personas de interés
  },

  {
    title: 'Victimas',
    href: '/dashboard/victima',
    icon: 'UserRound',
    label: 'victima',
    color: 'purple' // Púrpura para víctimas
  },

  {
    title: 'Mapas Delitos',
    href: '/dashboard/geo',
    icon: 'map',
    label: 'Mapas',
    color: 'emerald' // Verde esmeralda para mapas
  },
  
  {
    title: 'Genogramas',
    href: '/dashboard/genograma',
    icon: 'Waipoints',
    label: 'Genogramas',
    color: 'teal' // Teal para visualizaciones
  },

  {
    title: 'Registro Organizaciones',
    icon: 'Net',
    color: 'red', // Rojo para organizaciones criminales
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
    color: 'cyan', // Cyan para teléfonos
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
    label: 'reportes',
    color: 'indigo' // Índigo para reportes
  },

  {
    title: 'Utiles',    
    icon: 'tool',
    label: 'utiles',
    color: 'gray', // Gris para utilidades
    subItems: [
      {
        title: 'Correlativos',
        href: '/dashboard/correlativos',
        icon: 'report',
        label: 'correlativos',
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
