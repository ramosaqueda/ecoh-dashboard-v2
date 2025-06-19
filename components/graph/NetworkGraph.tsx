'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3'; 

// Interfaces de tipos
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  val: number;
  type: 'organization' | 'imputado' | 'causa';
  color: string;
  org?: Organization;
  imputado?: Imputado;
  causa?: Causa;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
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

interface Causa {
  id: number;
  ruc: string;
  denominacionCausa: string;
  delito?: {
    nombre: string;
  };
}

interface Organization {
  id: number;
  nombre: string;
  activa: boolean;
  tipoOrganizacionId: number;
  miembros?: Miembro[];
  causas?: Array<{ causa: Causa }>;
}

interface OrganizationNetworkGraphProps {
  data: GraphData;
  filters: GraphFilters;
  linkDistance?: number;
  nodeSize?: number;
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
}

const OrganizationNetworkGraph: React.FC<OrganizationNetworkGraphProps> = ({ 
  data, 
  filters, 
  linkDistance = 150,
  nodeSize = 15,
  onNodeClick,
  className = "w-full h-full"
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes.length) return;

    // Configuración del gráfico
    const width = svgRef.current.clientWidth || 1200;
    const height = svgRef.current.clientHeight || 800;

    // Limpiar SVG existente
    d3.select(svgRef.current).selectAll('*').remove();

    // Crear contenedor principal
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Crear grupo para zoom/pan
    const g = svg.append('g');

    // Configurar zoom con type assertion completa
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform);
      });

    (svg as any).call(zoom); // ✅ Type assertion completa

    // Crear simulación de fuerzas con type assertion completa
    const simulation = (d3.forceSimulation as any)(data.nodes)
      .force(
        'link',
        (d3.forceLink as any)(data.links)
          .id((d: any) => d.id)
          .distance(linkDistance)
          .strength(0.1)
      )
      .force('charge', (d3.forceManyBody as any)().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', (d3.forceCollide as any)().radius(nodeSize + 5));

    // Escala de colores
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['organization', 'imputado', 'causa'])
      .range(['#3b82f6', '#10b981', '#f59e0b'])
      .unknown('#6b7280');

    // Crear enlaces
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value || 1));

    // Funciones de drag simplificadas
    const dragStarted = (event: any, d: any): void => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: any, d: any): void => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragEnded = (event: any, d: any): void => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    // Crear nodos con drag completamente simplificado (CORRECCIÓN LÍNEA 135)
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        (d3.drag() as any) // ✅ CORRECCIÓN: Type assertion completa para resolver conflictos
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      )
      .on('click', (event: any, d: any) => {
        event.stopPropagation();
        if (onNodeClick) {
          onNodeClick(d);
        }
      });

    // Agregar formas a los nodos según el tipo con type assertions
    (node as any).each(function(this: any, d: any) { // ✅ Tipar 'this'
      const nodeGroup = d3.select(this);

      if (d.type === 'organization') {
        // Rectángulos para organizaciones
        nodeGroup
          .append('rect')
          .attr('width', nodeSize * 2)
          .attr('height', nodeSize * 1.5)
          .attr('x', -nodeSize)
          .attr('y', -nodeSize * 0.75)
          .attr('fill', colorScale(d.type))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('rx', 3);
      } else if (d.type === 'causa') {
        // Diamantes para causas
        const size = nodeSize;
        nodeGroup
          .append('polygon')
          .attr('points', `0,${-size} ${size},0 0,${size} ${-size},0`)
          .attr('fill', colorScale(d.type))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      } else {
        // Círculos para imputados
        nodeGroup
          .append('circle')
          .attr('r', nodeSize)
          .attr('fill', colorScale(d.type))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }

      // Agregar etiquetas
      nodeGroup
        .append('text')
        .text(d.name)
        .attr('x', 0)
        .attr('y', nodeSize + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .style('pointer-events', 'none');
    });

    // Agregar tooltips con type assertions
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    (node as any)
      .on('mouseover', (event: any, d: any) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        
        let tooltipContent = `<strong>${d.name}</strong><br/>`;
        tooltipContent += `Tipo: ${d.type}<br/>`;
        
        if (d.type === 'organization' && d.org) {
          tooltipContent += `Miembros: ${d.org.miembros?.length || 0}<br/>`;
          tooltipContent += `Estado: ${d.org.activa ? 'Activa' : 'Inactiva'}`;
        } else if (d.type === 'imputado' && d.imputado) {
          tooltipContent += `ID: ${d.imputado.docId || 'N/A'}`;
        } else if (d.type === 'causa' && d.causa) {
          tooltipContent += `RUC: ${d.causa.ruc}<br/>`;
          tooltipContent += `Delito: ${d.causa.delito?.nombre || 'N/A'}`;
        }

        tooltip
          .html(tooltipContent)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Actualizar posiciones en cada tick con type assertions
    simulation.on('tick', () => {
      (link as any)
        .attr('x1', (d: any) => d.source.x || 0)
        .attr('y1', (d: any) => d.source.y || 0)
        .attr('x2', (d: any) => d.target.x || 0)
        .attr('y2', (d: any) => d.target.y || 0);

      (node as any).attr('transform', (d: any) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Función de limpieza con type assertions
    return () => {
      if (simulation) simulation.stop();
      try {
        tooltip.remove();
      } catch (e) {
        // Tooltip ya removido
      }
    };

  }, [data, filters, linkDistance, nodeSize, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className={className} />
      
      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-sm mb-3">Leyenda</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-3 bg-blue-500 rounded mr-2 flex-shrink-0" />
            <span>Organizaciones</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex-shrink-0" />
            <span>Imputados</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 mr-2 flex-shrink-0 transform rotate-45" />
            <span>Causas</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="font-semibold text-xs mb-2">Interacciones</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            <li>• Arrastra los nodos para moverlos</li>
            <li>• Usa la rueda del mouse para zoom</li>
            <li>• Haz clic en un nodo para más detalles</li>
            <li>• Pasa el mouse sobre un nodo para info rápida</li>
          </ul>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-xs space-y-1">
          <div>Nodos: <span className="font-semibold">{data.nodes.length}</span></div>
          <div>Enlaces: <span className="font-semibold">{data.links.length}</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationNetworkGraph;