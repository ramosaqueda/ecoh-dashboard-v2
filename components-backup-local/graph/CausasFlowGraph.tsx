// components/graphs/CausasRadialGraph.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

interface Causa {
  id: number;
  ruc: string;
  denominacionCausa: string;
}

interface CausaRelacionada {
  id: number;
  causaMadre: Causa;
  causaArista: Causa;
  observacion: string;
}

interface CausasRadialGraphProps {
  causaId: string;
  relaciones: CausaRelacionada[];
  causaPrincipal: Causa;
}

export default function CausasRadialGraph({
  causaId,
  relaciones,
  causaPrincipal
}: CausasRadialGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const data = useMemo(() => {
    // Transformar los datos al formato necesario para el grafo radial
    const root = {
      name: causaPrincipal.ruc,
      children: relaciones.map(rel => {
        const causaRelacionada = rel.causaMadre.id.toString() === causaId 
          ? rel.causaArista 
          : rel.causaMadre;
        return {
          name: causaRelacionada.ruc,
          tooltip: causaRelacionada.denominacionCausa,
          size: 1,
          info: rel.observacion
        };
      })
    };
    return root;
  }, [causaId, relaciones, causaPrincipal]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 100;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Crear las líneas
    const line = d3.lineRadial<any>()
      .radius(d => d.y)
      .angle(d => d.x)
      .curve(d3.curveBundle.beta(0.85));

    // Calcular posiciones
    const angle = 2 * Math.PI / data.children.length;
    
    // Dibujar líneas radiales
    data.children.forEach((child, i) => {
      const currentAngle = i * angle - Math.PI / 2;
      
      // Línea desde el centro
      svg.append('path')
        .attr('d', line([
          { x: currentAngle, y: 0 },
          { x: currentAngle, y: radius }
        ]))
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5);

      // Nodo en el extremo
      const x = radius * Math.cos(currentAngle);
      const y = radius * Math.sin(currentAngle);

      // Círculo del nodo
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', '#22c55e')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Texto del RUC
      svg.append('text')
        .attr('x', x * 1.1)
        .attr('y', y * 1.1)
        .attr('text-anchor', x > 0 ? 'start' : 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#1e293b')
        .attr('font-size', '12px')
        .text(child.name);

      // Texto de la observación (más pequeño y gris)
      svg.append('text')
        .attr('x', x * 1.1)
        .attr('y', y * 1.1 + 15)
        .attr('text-anchor', x > 0 ? 'start' : 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .text(child.info);
    });

    // Nodo central
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
      .attr('fill', '#4f46e5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Texto del nodo central
    svg.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1e293b')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(data.name);

  }, [data]);

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}