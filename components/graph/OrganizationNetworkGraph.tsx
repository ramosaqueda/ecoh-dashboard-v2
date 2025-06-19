import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraphControls } from './controls/GraphControls';
import { DetailPanel } from './detail/DetailPanel';
import * as d3 from 'd3';

// Interfaces
interface Organization {
  id: number;
  nombre: string;
  activa: boolean;
  tipoOrganizacionId: number;
  miembros?: Member[];
}

interface Member {
  imputadoId: number;
  activo: boolean;
  rol?: string;
  imputado?: Imputado;
}

interface Imputado {
  id: number;
  nombreSujeto: string;
  organizaciones?: Organization[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  val: number;
  type: 'organization' | 'imputado';
  color: string;
  org?: Organization;
  imputado?: Imputado;
  organizaciones?: Organization[];
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  rol?: string;
}

interface TipoOrganizacion {
  id: number;
  nombre: string;
}

const OrganizationNetworkGraph: React.FC = () => {
  // Referencias y estados
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tipos, setTipos] = useState<TipoOrganizacion[]>([]);
  const [originalData, setOriginalData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth - 100 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 250 : 600
  });

  const [filters, setFilters] = useState({
    tipoOrganizacion: 'all',
    showActiveOnly: false,
    searchTerm: ''
  });

  const [visualConfig, setVisualConfig] = useState({
    linkDistance: 150,
    nodeSize: 20,
    charge: -400
  });

  // Funciones de utilidad
  const generateUniqueColor = (index: number) => {
    const hue = (index * 137.508) % 360;
    return d3.hsl(hue, 0.7, 0.5).toString();
  };

  // Inicialización y actualización del grafo
  const initializeGraph = (data: { nodes: GraphNode[]; links: GraphLink[] }) => {
    if (!svgRef.current) return;

    // Limpiar SVG existente
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Crear el contenedor principal con zoom
    const g = svg.append('g');

    // Configurar zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Crear la simulación
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .distance(visualConfig.linkDistance))
      .force('charge', d3.forceManyBody()
        .strength(visualConfig.charge))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(visualConfig.nodeSize * 1.5));

    simulationRef.current = simulation;

    // Crear las líneas para los enlaces
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Crear los grupos de nodos
    const node = g.append('g')
        .selectAll('.node')
        .data(data.nodes)
        .join('g')
        .attr('class', 'node')
        .call((d3.drag() as any)  // ✅ Type assertion para resolver conflictos
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded));

    // Añadir formas de nodos
    node.each(function(d) {
      const element = d3.select(this);
      if (d.type === 'organization') {
        element.append('rect')
          .attr('width', visualConfig.nodeSize * 1.5)
          .attr('height', visualConfig.nodeSize * 1.5)
          .attr('x', -visualConfig.nodeSize * 0.75)
          .attr('y', -visualConfig.nodeSize * 0.75)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      } else {
        element.append('circle')
          .attr('r', visualConfig.nodeSize / 2)
          .attr('fill', d.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }

      element.append('text')
        .attr('dy', visualConfig.nodeSize)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .text(d.name);
    });

    // Eventos de hover y click
    node
      .on('mouseover', function(event, d) {
        d3.select(this).select('rect, circle')
          .attr('stroke', '#000')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        if (selectedNode?.id !== d.id) {
          d3.select(this).select('rect, circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);
        }
      })
      .on('click', (event, d) => handleNodeClick(d));

    // Funciones de arrastre
    function dragStarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Actualizar posiciones
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Centrar el grafo inicialmente
    const initialScale = 0.8;
    const transform = d3.zoomIdentity
      .translate(dimensions.width / 2, dimensions.height / 2)
      .scale(initialScale)
      .translate(-dimensions.width / 2, -dimensions.height / 2);
    
    svg.call(zoom.transform, transform);
  };

  const processGraphData = (nodes: GraphNode[], links: GraphLink[]) => {
    // Primero identificamos los nodos que coinciden con la búsqueda directamente
    const matchingNodes = nodes.filter(node => {
      const matchesSearch = !filters.searchTerm || 
        node.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      if (node.type === 'organization') {
        const matchesTipo = filters.tipoOrganizacion === 'all' || 
          node.org?.tipoOrganizacionId.toString() === filters.tipoOrganizacion;
        const matchesActive = !filters.showActiveOnly || node.org?.activa;
        return matchesSearch && matchesTipo && matchesActive;
      }
      
      return matchesSearch;
    });

    // Crear un conjunto de IDs de nodos que coinciden directamente
    const matchingNodeIds = new Set(matchingNodes.map(n => n.id));

    // Si estamos buscando, incluir también los nodos relacionados
    if (filters.searchTerm) {
      // Encontrar todos los nodos relacionados a través de enlaces
      links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        if (matchingNodeIds.has(sourceId)) {
          // Si el nodo fuente coincide, incluir el nodo objetivo
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) {
            matchingNodeIds.add(targetId);
          }
        }
        
        if (matchingNodeIds.has(targetId)) {
          // Si el nodo objetivo coincide, incluir el nodo fuente
          const sourceNode = nodes.find(n => n.id === sourceId);
          if (sourceNode) {
            matchingNodeIds.add(sourceId);
          }
        }
      });
    }

    // Filtrar nodos basados en el conjunto expandido de IDs
    const filteredNodes = nodes.filter(node => matchingNodeIds.has(node.id));

    // Filtrar enlaces que conectan los nodos filtrados
    const filteredLinks = links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return matchingNodeIds.has(sourceId) && matchingNodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  };

  const updateVisualizations = () => {
    if (!originalData || !svgRef.current) return;
    const filteredData = processGraphData(originalData.nodes, originalData.links);
    initializeGraph(filteredData);
  };

  const handleNodeClick = async (node: GraphNode) => {
    try {
      if (node.type === 'organization' && node.org?.id) {
        const response = await fetch(`/api/organizacion/${node.org.id}`);
        if (!response.ok) throw new Error('Error al cargar detalles de la organización');
        const orgData = await response.json();
        setSelectedNode({ ...node, org: orgData });
      } else if (node.type === 'imputado' && node.imputado?.id) {
        const response = await fetch(`/api/imputado/${node.imputado.id}`);
        if (!response.ok) throw new Error('Error al cargar detalles del imputado');
        const imputadoData = await response.json();
        setSelectedNode({
          ...node,
          imputado: imputadoData,
          organizaciones: imputadoData.organizaciones || []
        });
      }
    } catch (error) {
      console.error('Error loading node details:', error);
      setError('Error al cargar los detalles. Por favor, intente nuevamente.');
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orgResponse, tiposResponse] = await Promise.all([
        fetch('/api/organizacion'),
        fetch('/api/tipo-organizacion')
      ]);
      
      if (!orgResponse.ok || !tiposResponse.ok) 
        throw new Error('Error al cargar datos');
      
      const orgData = await orgResponse.json();
      const tiposData = await tiposResponse.json();
      
      setTipos(tiposData);

      // Procesar nodos y enlaces
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      let colorIndex = 0;

      orgData.data.forEach((org: Organization) => {
        const orgColor = generateUniqueColor(colorIndex++);
        nodes.push({
          id: `org-${org.id}`,
          name: org.nombre,
          val: visualConfig.nodeSize,
          type: 'organization',
          color: orgColor,
          org: org
        });

        if (org.miembros?.length) {
          org.miembros.forEach(member => {
            if (member.imputado) {
              const imputadoId = `imp-${member.imputadoId}`;
              
              if (!nodes.find(n => n.id === imputadoId)) {
                nodes.push({
                  id: imputadoId,
                  name: member.imputado.nombreSujeto,
                  val: visualConfig.nodeSize,
                  type: 'imputado',
                  color: orgColor,
                  imputado: member.imputado
                });
              }

              links.push({
                source: `org-${org.id}`,
                target: imputadoId,
                value: visualConfig.linkDistance,
                rol: member.rol || 'Sin rol'
              });
            }
          });
        }
      });

      const initialGraphData = { nodes, links };
      setOriginalData(initialGraphData);

      // Inicializar el grafo inmediatamente después de procesar los datos
      requestAnimationFrame(() => {
        initializeGraph(initialGraphData);
      });

    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 250
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Cargar datos iniciales
    loadInitialData();

    return () => {
      window.removeEventListener('resize', handleResize);
      // Limpiar la simulación al desmontar
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  // Efecto para manejar actualizaciones de filtros y configuración visual
  useEffect(() => {
    if (originalData && !loading) {
      requestAnimationFrame(() => {
        updateVisualizations();
      });
    }
  }, [filters, visualConfig, loading]);

  // Efecto para actualizar el grafo cuando cambian las dimensiones
  useEffect(() => {
    if (originalData && !loading) {
      const timer = setTimeout(() => {
        updateVisualizations();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dimensions]);

  // Renderizado de estados de carga y error
  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando grafo...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Renderizado principal
  return (
    <div className="space-y-4">
      <GraphControls
        onSearch={handleSearch}
        tipoOrganizacion={filters.tipoOrganizacion}
        onTipoChange={(value) => setFilters(prev => ({ ...prev, tipoOrganizacion: value }))}
        showActiveOnly={filters.showActiveOnly}
        onActiveChange={(value) => setFilters(prev => ({ ...prev, showActiveOnly: value }))}
        tipos={tipos}
        linkDistance={visualConfig.linkDistance}
        onLinkDistanceChange={(value) => {
          setVisualConfig(prev => ({ ...prev, linkDistance: value }));
        }}
        nodeSize={visualConfig.nodeSize}
        onNodeSizeChange={(value) => {
          setVisualConfig(prev => ({ ...prev, nodeSize: value }));
        }}
        className="mb-4"
        svgRef={svgRef}
      />

      <Card className="p-4 bg-white">
        <svg 
          ref={svgRef}
          className="w-full"
          style={{ 
            background: '#fff',
            maxHeight: `${dimensions.height}px`
          }}
        />
      </Card>

      <DetailPanel 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />
    </div>
  );
};

export default OrganizationNetworkGraph;