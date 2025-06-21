// components/graph/hooks/useGraphData.tsx
import { useState, useEffect } from 'react';

// Interfaces de tipos (si no están importadas desde graph.types)
interface GraphNode {
  id: string;
  name: string;
  val: number;
  type: 'organization' | 'imputado' | 'causa';
  color: string;
  org?: Organization;
  imputado?: Imputado;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  rol?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphFilters {
  searchTerm: string;
  tipoOrganizacion: string;
  showActiveOnly: boolean;
}

interface TipoOrganizacion {
  id: number;
  nombre: string;
}

interface Imputado {
  id: number;
  nombreSujeto: string;
  docId?: string;
  fotoPrincipal?: string;
}

interface Miembro {
  id: number;
  imputadoId: number;
  rol?: string;
  activo?: boolean;
  imputado: Imputado;
}

interface Organization {
  id: number;
  nombre: string;
  activa: boolean;
  tipoOrganizacionId: number;
  miembros?: Miembro[];
}

interface RawData {
  organizations: Organization[];
  tipos: TipoOrganizacion[];
}

interface UseGraphDataReturn {
  graphData: GraphData;
  loading: boolean;
  error: string | null;
  tipos: TipoOrganizacion[];
}

export const useGraphData = (filters: GraphFilters): UseGraphDataReturn => {
  const [rawData, setRawData] = useState<RawData>({
    organizations: [],
    tipos: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const [orgResponse, tiposResponse] = await Promise.all([
          fetch('/api/organizacion'),
          fetch('/api/tipo-organizacion')
        ]);

        if (!orgResponse.ok || !tiposResponse.ok) {
          throw new Error('Error al cargar datos');
        }

        const orgData = await orgResponse.json();
        const tiposData = await tiposResponse.json();

        setRawData({
          organizations: orgData.data || orgData,
          tipos: tiposData
        });
      } catch (error) {
        console.error('Error:', error);
        // Manejo correcto de errores unknown
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Procesar datos según filtros
  useEffect(() => {
    const processGraphData = (): void => {
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      
      rawData.organizations
        .filter(org => {
          const matchesSearch = filters.searchTerm === '' || 
            org.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase());
          const matchesTipo = filters.tipoOrganizacion === 'all' || 
            org.tipoOrganizacionId.toString() === filters.tipoOrganizacion;
          const matchesActive = !filters.showActiveOnly || org.activa;
          
          return matchesSearch && matchesTipo && matchesActive;
        })
        .forEach(org => {
          // Añadir nodo de organización
          nodes.push({
            id: `org-${org.id}`,
            name: org.nombre,
            val: 20,
            type: 'organization',
            color: org.activa ? '#4CAF50' : '#f44336',
            org
          });

          // Procesar miembros
          org.miembros?.forEach(member => {
            const imputadoNodeId = `imp-${member.imputadoId}`;
            
            // Verificar si el nodo del imputado ya existe
            if (!nodes.find(n => n.id === imputadoNodeId)) {
              nodes.push({
                id: imputadoNodeId,
                name: member.imputado.nombreSujeto,
                val: 10,
                type: 'imputado',
                color: member.activo ? '#2196F3' : '#9E9E9E',
                imputado: member.imputado
              });
            }

            // Añadir enlace entre organización e imputado
            links.push({
              source: `org-${org.id}`,
              target: imputadoNodeId,
              value: 1,
              rol: member.rol
            });
          });
        });

      setGraphData({ nodes, links });
    };

    if (rawData.organizations.length > 0) {
      processGraphData();
    }
  }, [rawData, filters]);

  return { 
    graphData, 
    loading, 
    error, 
    tipos: rawData.tipos 
  };
};