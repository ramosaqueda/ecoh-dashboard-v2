'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  Search,
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  UserRound,
  Map,
  Network,
  Smartphone,
  FileText,
  Wrench,
  Plus,
  ExternalLink,
  Briefcase,
  Ghost,
  Share2,
  BarChart3,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { useCommandStats } from '@/hooks/useCommandStats';
import { toast } from 'sonner';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CausaSearchResult {
  id: number;
  ruc: string;
  nombreDelito: string;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { history, addToHistory, clearHistory } = useCommandHistory();
  const stats = useCommandStats();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [causasResults, setCausasResults] = React.useState<CausaSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Obtener URLs de variables de entorno
  const duoUrl = 'http://172.18.1.94/login/';
  const claveUnicaUrl = 'http://172.18.1.94/EscritorioMP/login_cu.php';
  const ecohLink = process.env.NEXT_PUBLIC_ECOHLINK || '';

  // Búsqueda de causas por RUC con debounce
  React.useEffect(() => {
    const searchCausas = async () => {
      // Solo buscar si el query parece un RUC (números y guiones)
      const rucPattern = /^[\d-]+$/;
      if (!searchQuery || !rucPattern.test(searchQuery) || searchQuery.length < 4) {
        setCausasResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/causas/search?ruc=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setCausasResults(data.slice(0, 5)); // Limitar a 5 resultados
        }
      } catch (error) {
        console.error('Error searching causas:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchCausas, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = React.useCallback((
    callback: () => void,
    historyItem?: { id: string; title: string; href?: string }
  ) => {
    onOpenChange(false);
    callback();
    
    // Agregar al historial
    if (historyItem) {
      addToHistory(historyItem);
    }
  }, [onOpenChange, addToHistory]);

  // Determinar acciones contextuales según la página actual
  const getContextualActions = () => {
    const actions = [];

    if (pathname?.includes('/causas')) {
      actions.push({
        icon: Plus,
        label: 'Nueva Causa (en esta página)',
        action: () => router.push('/dashboard/causas?action=new'),
      });
    }

    if (pathname?.includes('/actividades')) {
      actions.push({
        icon: Plus,
        label: 'Nueva Actividad (en esta página)',
        action: () => router.push('/dashboard/actividades?action=new'),
      });
    }

    if (pathname?.includes('/imputado')) {
      actions.push({
        icon: Plus,
        label: 'Nuevo Imputado (en esta página)',
        action: () => router.push('/dashboard/imputado?action=new'),
      });
    }

    return actions;
  };

  const contextualActions = getContextualActions();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Buscar en ECOH Insight</DialogTitle>
      <CommandInput 
        placeholder="Buscar o escribir RUC..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Buscando causas...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
              <p className="text-xs text-muted-foreground">
                Intenta buscar por RUC (ej: 2300123456-7)
              </p>
            </div>
          )}
        </CommandEmpty>

        {/* Resultados de búsqueda de causas por RUC */}
        {causasResults.length > 0 && (
          <>
            <CommandGroup heading="🔍 Causas Encontradas">
              {causasResults.map((causa) => (
                <CommandItem
                  key={causa.id}
                  onSelect={() => handleSelect(
                    () => router.push(`/dashboard/causas/${causa.id}`),
                    {
                      id: `causa-${causa.id}`,
                      title: `Causa ${causa.ruc}`,
                      href: `/dashboard/causas/${causa.id}`,
                    }
                  )}
                >
                  <Briefcase className="mr-2 h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{causa.ruc}</span>
                    <span className="text-xs text-muted-foreground">{causa.nombreDelito}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Historial de búsquedas recientes */}
        {history.length > 0 && searchQuery === '' && (
          <>
            <CommandGroup heading="🕐 Recientes">
              {history.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(
                    () => item.href ? router.push(item.href) : item.action?.(),
                    undefined
                  )}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() => {
                  clearHistory();
                  toast.success('Historial eliminado');
                }}
                className="text-muted-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Limpiar historial</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Acciones Contextuales */}
        {contextualActions.length > 0 && searchQuery === '' && (
          <>
            <CommandGroup heading="⚡ Acciones en esta página">
              {contextualActions.map((action, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSelect(action.action)}
                >
                  <action.icon className="mr-2 h-4 w-4 text-blue-600" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Acciones Rápidas */}
        <CommandGroup heading="⚡ Acciones Rápidas">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/causas?action=new'),
              {
                id: 'crear-causa',
                title: 'Crear Nueva Causa',
                href: '/dashboard/causas?action=new',
              }
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Crear Nueva Causa</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/actividades?action=new'),
              {
                id: 'crear-actividad',
                title: 'Crear Nueva Actividad',
                href: '/dashboard/actividades?action=new',
              }
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Crear Nueva Actividad</span>
            {stats.actividadesPendientes > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {stats.actividadesPendientes}
              </Badge>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/imputado?action=new'),
              {
                id: 'crear-imputado',
                title: 'Registrar Imputado',
                href: '/dashboard/imputado?action=new',
              }
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Registrar Imputado</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navegación Principal */}
        <CommandGroup heading="🏠 Navegación">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard'),
              {
                id: 'dashboard',
                title: 'Dashboard',
                href: '/dashboard',
              }
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Gestión de Causas */}
        <CommandGroup heading="📂 Gestión de Causas">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/causas'),
              {
                id: 'causas',
                title: 'Causas',
                href: '/dashboard/causas',
              }
            )}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Causas</span>
            {stats.causasActivas > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {stats.causasActivas}
              </Badge>
            )}
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/kanban'),
              {
                id: 'kanban',
                title: 'Tablero de Actividades',
                href: '/dashboard/kanban',
              }
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Tablero de Actividades</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actividades */}
        <CommandGroup heading="✅ Actividades">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/actividades'),
              {
                id: 'actividades',
                title: 'Gestión de Actividades',
                href: '/dashboard/actividades',
              }
            )}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Gestión de Actividades</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/todo'),
              {
                id: 'todo',
                title: 'Actividades por Usuario',
                href: '/dashboard/todo',
              }
            )}
          >
            <UserRound className="mr-2 h-4 w-4" />
            <span>Actividades por Usuario</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Personas */}
        <CommandGroup heading="👥 Personas">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/imputado'),
              {
                id: 'imputado',
                title: 'Imputados',
                href: '/dashboard/imputado',
              }
            )}
          >
            <Ghost className="mr-2 h-4 w-4" />
            <span>Imputados o Sujetos de Interés</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/victima'),
              {
                id: 'victima',
                title: 'Víctimas',
                href: '/dashboard/victima',
              }
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Víctimas</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Análisis */}
        <CommandGroup heading="🗺️ Análisis y Visualización">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/geo'),
              {
                id: 'geo',
                title: 'Mapas de Delitos',
                href: '/dashboard/geo',
              }
            )}
          >
            <Map className="mr-2 h-4 w-4" />
            <span>Mapas de Delitos</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/genograma'),
              {
                id: 'genograma',
                title: 'Genogramas',
                href: '/dashboard/genograma',
              }
            )}
          >
            <Network className="mr-2 h-4 w-4" />
            <span>Genogramas</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Organizaciones */}
        <CommandGroup heading="🏢 Organizaciones Criminales">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/organizacion'),
              {
                id: 'organizacion',
                title: 'Gestión de Organizaciones',
                href: '/dashboard/organizacion',
              }
            )}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Gestión de Organizaciones</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/oc-networkgraph'),
              {
                id: 'oc-network',
                title: 'Network Graph',
                href: '/dashboard/oc-networkgraph',
              }
            )}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span>Network Graph</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Teléfonos */}
        <CommandGroup heading="📱 Teléfonos">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/telefonos'),
              {
                id: 'telefonos',
                title: 'Gestión de Teléfonos',
                href: '/dashboard/telefonos',
              }
            )}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            <span>Gestión de Teléfonos</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/telefonos/grafo'),
              {
                id: 'telefonos-grafo',
                title: 'Grafo de Teléfonos',
                href: '/dashboard/telefonos/grafo',
              }
            )}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span>Grafo de Teléfonos</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Reportes */}
        <CommandGroup heading="📊 Reportes">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/reportes'),
              {
                id: 'reportes',
                title: 'Reportes',
                href: '/dashboard/reportes',
              }
            )}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reportes y Estadísticas</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Útiles */}
        <CommandGroup heading="🛠️ Herramientas Útiles">
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/correlativos'),
              {
                id: 'correlativos',
                title: 'Correlativos',
                href: '/dashboard/correlativos',
              }
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Correlativos</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => router.push('/dashboard/validarut'),
              {
                id: 'validarut',
                title: 'Validar RUN',
                href: '/dashboard/validarut',
              }
            )}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Validar RUN</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Enlaces Externos */}
        <CommandGroup heading="🔗 Enlaces Externos">
          <CommandItem
            onSelect={() => handleSelect(
              () => window.open(duoUrl, '_blank'),
              {
                id: 'duo',
                title: 'Escritorio FN - DUO',
              }
            )}
          >
            <ExternalLink className="mr-2 h-4 w-4 text-green-600" />
            <span>Escritorio FN - Acceso vía DUO</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(
              () => window.open(claveUnicaUrl, '_blank'),
              {
                id: 'clave-unica',
                title: 'Escritorio FN - Clave Única',
              }
            )}
          >
            <ExternalLink className="mr-2 h-4 w-4 text-blue-600" />
            <span>Escritorio FN - Clave Única</span>
          </CommandItem>
          {ecohLink && ecohLink !== '#' && (
            <CommandItem
              onSelect={() => handleSelect(
                () => window.open(ecohLink, '_blank'),
                {
                  id: 'ecoh-link',
                  title: 'ECOH Link',
                }
              )}
            >
              <ExternalLink className="mr-2 h-4 w-4 text-purple-600" />
              <span>ECOH Link</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
