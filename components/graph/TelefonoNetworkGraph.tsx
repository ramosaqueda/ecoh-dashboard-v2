import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as d3 from 'd3';
import { Loader2, Search, Sliders, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

// Interfaces
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  title: string;
  group: 'causa' | 'telefono';
  val: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const TelefonoNetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth - 100 : 800,
    height: typeof window !== 'undefined' ? window.innerHeight - 250 : 600
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [visualConfig, setVisualConfig] = useState({
    linkDistance: 100,
    nodeSize: 10,
    charge: -200
  });

  // Initialize Graph
  const initializeGraph = (data: { nodes: GraphNode[]; links: GraphLink[] }) => {
    if (!svgRef.current) return;

    // Clear existing SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .distance(visualConfig.linkDistance))
      .force('charge', d3.forceManyBody()
        .strength(visualConfig.charge))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(visualConfig.nodeSize * 1.5));

    simulationRef.current = simulation;

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    // Nodes
    const node = g.append('g')
      .selectAll('.node')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node')
      .call((d3.drag() as any)
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Node Shapes
    node.each(function(d) {
      const element = d3.select(this);
      const size = d.val ? Math.sqrt(d.val) * 3 : visualConfig.nodeSize; // Scale size based on val

      if (d.group === 'causa') {
        // Causa: Rectangle (Blue)
        element.append('rect')
          .attr('width', size * 2)
          .attr('height', size * 2)
          .attr('x', -size)
          .attr('y', -size)
          .attr('fill', '#2563eb')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      } else {
        // Telefono: Circle (Green)
        element.append('circle')
          .attr('r', size)
          .attr('fill', '#16a34a')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }

      // Label
      element.append('text')
        .attr('dy', size + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1e293b')
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .text(d.label);
    });

    // Tooltip/Hover
    node.append('title').text(d => d.title);

    // Drag functions
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

    // Tick update
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  };

  const processGraphData = (nodes: GraphNode[], links: GraphLink[]) => {
    if (!searchTerm) return { nodes, links };

    const lowerSearch = searchTerm.toLowerCase();
    
    // Find matching nodes
    const matchingNodes = nodes.filter(node => 
      node.label.toLowerCase().includes(lowerSearch) || 
      node.title.toLowerCase().includes(lowerSearch)
    );

    const matchingNodeIds = new Set(matchingNodes.map(n => n.id));

    // Include connected nodes
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      if (matchingNodeIds.has(sourceId)) {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) matchingNodeIds.add(targetId);
      }
      if (matchingNodeIds.has(targetId)) {
        const sourceNode = nodes.find(n => n.id === sourceId);
        if (sourceNode) matchingNodeIds.add(sourceId);
      }
    });

    const filteredNodes = nodes.filter(node => matchingNodeIds.has(node.id));
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/telefonos/grafo');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setOriginalData(result);
        initializeGraph(result);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del grafo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 250
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (originalData && !loading) {
      updateVisualizations();
    }
  }, [searchTerm, visualConfig, dimensions]);

  if (loading) {
    return (
      <Card className="p-4 flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando grafo...</span>
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar RUC, Teléfono o Abonado..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Sliders className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Distancia</Label>
                    <span className="text-sm text-muted-foreground">{visualConfig.linkDistance}px</span>
                  </div>
                  <Slider
                    value={[visualConfig.linkDistance]}
                    onValueChange={([val]) => setVisualConfig(prev => ({ ...prev, linkDistance: val }))}
                    min={50} max={300} step={10}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Tamaño Nodos</Label>
                    <span className="text-sm text-muted-foreground">{visualConfig.nodeSize}</span>
                  </div>
                  <Slider
                    value={[visualConfig.nodeSize]}
                    onValueChange={([val]) => setVisualConfig(prev => ({ ...prev, nodeSize: val }))}
                    min={5} max={30} step={1}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Graph */}
      <Card className="p-4 bg-white overflow-hidden border-2">
        <svg
          ref={svgRef}
          className="w-full"
          style={{ background: '#f8fafc', maxHeight: `${dimensions.height}px` }}
        />
        
        {/* Legend */}
        <div className="absolute bottom-8 right-8 bg-white/90 p-3 rounded-lg shadow-md border text-sm z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-blue-600 border border-white"></div>
            <span className="font-medium">Causa (Cuadrado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
            <span className="font-medium">Teléfono (Círculo)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TelefonoNetworkGraph;
