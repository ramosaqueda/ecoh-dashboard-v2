'use client';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  Network,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

// ✅ Interfaces corregidas para coincidir con el schema
interface CausaRelacionada {
  id: number;
  ruc: string | null;
  denominacionCausa: string;
  comoCausaMadre: {
    total: number;
    relaciones: Array<{
      id: number;
      causaHija: {
        id: number;
        ruc: string | null;
        denominacionCausa: string;
      };
      tipoRelacion: string | null;
      fechaRelacion: string;
      observacion: string | null;
    }>;
  };
  comoCausaHija: {
    total: number;
    relaciones: Array<{
      id: number;
      causaMadre: {
        id: number;
        ruc: string | null;
        denominacionCausa: string;
      };
      tipoRelacion: string | null;
      fechaRelacion: string;
      observacion: string | null;
    }>;
  };
  totales: {
    relacionesTotales: number;
    comoMadre: number;
    comoHija: number;
  };
}

interface ReporteData {
  estadisticas: {
    totalCausas: number;
    totalRelaciones: number;
    causaConMasRelaciones: CausaRelacionada | null;
  };
  causas: CausaRelacionada[];
  filtros: {
    tipoRelacion: string | null;
    fechaDesde: string | null;
    fechaHasta: string | null;
    formato: string;
  };
}

interface ResumenData {
  resumen: {
    totalCausasConRelaciones: number;
    totalRelaciones: number;
    causasMadre: number;
    causasArista: number;
    topCausasMadre: Array<{
      id: number;
      ruc: string | null;
      denominacionCausa: string;
      totalRelaciones: number;
    }>;
    tiposRelacionMasComunes: Array<{
      tipoRelacion: string | null;
      _count: { tipoRelacion: number };
    }>;
  };
}

// ✅ Componente del grafo mejorado con D3.js
const GrafoRelaciones = ({ data }: { data: ReporteData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ✅ Función para generar datos del grafo
  const generarDatosGrafo = () => {
    if (!data) return { nodes: [], links: [] };

    const nodes: Array<{
      id: string;
      ruc: string;
      denominacion: string;
      relaciones: number;
      esMadre: boolean;
      esHija: boolean;
      x?: number;
      y?: number;
      fx?: number | null;
      fy?: number | null;
    }> = [];
    
    const links: Array<{
      source: string;
      target: string;
      tipoRelacion: string;
      observacion?: string;
    }> = [];

    // Crear nodos únicos
    const nodosMap = new Map();
    
    data.causas.forEach(causa => {
      if (!nodosMap.has(causa.id.toString())) {
        nodosMap.set(causa.id.toString(), {
          id: causa.id.toString(),
          ruc: causa.ruc || 'Sin RUC',
          denominacion: causa.denominacionCausa,
          relaciones: causa.totales.relacionesTotales,
          esMadre: causa.totales.comoMadre > 0,
          esHija: causa.totales.comoHija > 0
        });
      }

      // Crear enlaces desde relaciones como madre
      causa.comoCausaMadre.relaciones.forEach(rel => {
        // Agregar nodo hijo si no existe
        if (!nodosMap.has(rel.causaHija.id.toString())) {
          nodosMap.set(rel.causaHija.id.toString(), {
            id: rel.causaHija.id.toString(),
            ruc: rel.causaHija.ruc || 'Sin RUC',
            denominacion: rel.causaHija.denominacionCausa,
            relaciones: 1,
            esMadre: false,
            esHija: true
          });
        }

        // Crear enlace
        links.push({
          source: causa.id.toString(),
          target: rel.causaHija.id.toString(),
          tipoRelacion: rel.tipoRelacion || 'Sin especificar',
          observacion: rel.observacion || undefined
        });
      });
    });

    return {
      nodes: Array.from(nodosMap.values()),
      links
    };
  };

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const { nodes, links } = generarDatosGrafo();
    if (nodes.length === 0) return;

    // Limpiar SVG anterior
    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Agregar patrón de fondo
    const defs = svg.append("defs");
    const pattern = defs.append("pattern")
      .attr("id", "grid")
      .attr("width", 20)
      .attr("height", 20)
      .attr("patternUnits", "userSpaceOnUse");
    
    pattern.append("path")
      .attr("d", "M 20 0 L 0 0 0 20")
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    // Fondo con grid
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#grid)");

    // Crear grupo principal con zoom
    const g = svg.append("g");

    // Configurar zoom con límites
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Botones de control
    const controlsGroup = svg.append("g")
      .attr("class", "controls")
      .attr("transform", "translate(10, 10)");

    // Botón zoom in
    const zoomInBtn = controlsGroup.append("g")
      .attr("class", "zoom-btn")
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().call(zoom.scaleBy, 1.2);
      });

    zoomInBtn.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#374151")
      .attr("rx", 4);

    zoomInBtn.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("+");

    // Botón zoom out
    const zoomOutBtn = controlsGroup.append("g")
      .attr("class", "zoom-btn")
      .attr("transform", "translate(0, 35)")
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().call(zoom.scaleBy, 0.8);
      });

    zoomOutBtn.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#374151")
      .attr("rx", 4);

    zoomOutBtn.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("−");

    // Botón fit view
    const fitBtn = controlsGroup.append("g")
      .attr("class", "fit-btn")
      .attr("transform", "translate(0, 70)")
      .style("cursor", "pointer")
      .on("click", () => {
        const bounds = g.node()?.getBBox();
        if (bounds) {
          const fullWidth = bounds.width;
          const fullHeight = bounds.height;
          const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
          const translate = [width / 2 - scale * (bounds.x + fullWidth / 2), height / 2 - scale * (bounds.y + fullHeight / 2)];
          
          svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        }
      });

    fitBtn.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#374151")
      .attr("rx", 4);

    fitBtn.append("text")
      .attr("x", 15)
      .attr("y", 13)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "8px")
      .text("FIT");

    fitBtn.append("text")
      .attr("x", 15)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "8px")
      .text("VIEW");

    // Crear simulación de fuerzas mejorada
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-1000).distanceMax(300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(70).strength(0.9))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Crear markers para flechas
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#64748b")
      .style("stroke", "none");

    // Crear enlaces con etiquetas
    const linkGroup = g.append("g").attr("class", "links");
    
    const link = linkGroup.selectAll("g")
      .data(links)
      .enter().append("g");

    // Líneas de conexión
    link.append("line")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8)
      .attr("marker-end", "url(#arrowhead)");

    // Fondo para las etiquetas - agregar ANTES de las etiquetas
    link.append("rect")
      .attr("class", "link-label-bg")
      .attr("fill", "white")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("rx", 3)
      .attr("opacity", 0.9);

    // Etiquetas de los enlaces - agregar DESPUÉS del fondo
    const linkLabels = link.append("text")
      .attr("class", "link-label")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", -2)
      .text((d: any) => d.tipoRelacion);

    // Crear nodos
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag<SVGGElement, any>()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Rectángulos de los nodos (estilo card)
    node.append("rect")
      .attr("width", 140)
      .attr("height", 60)
      .attr("x", -70)
      .attr("y", -30)
      .attr("rx", 8)
      .attr("fill", (d: any) => {
        if (d.esMadre && d.esHija) return "#8b5cf6"; // Violeta - ambos roles
        if (d.esMadre) return "#3b82f6"; // Azul - solo madre
        if (d.esHija) return "#10b981"; // Verde - solo hija
        return "#6b7280"; // Gris - sin relaciones
      })
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
      .style("cursor", "pointer");

    // RUC (título principal)
    node.append("text")
      .attr("class", "node-ruc")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d: any) => d.ruc.length > 16 ? d.ruc.substring(0, 16) + "..." : d.ruc);

    // Denominación (subtítulo)
    node.append("text")
      .attr("class", "node-denominacion")
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("fill", "rgba(255,255,255,0.9)")
      .text((d: any) => d.denominacion.length > 20 ? d.denominacion.substring(0, 20) + "..." : d.denominacion);

    // Número de relaciones
    node.append("text")
      .attr("class", "node-relaciones")
      .attr("x", 0)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "white")
      .text((d: any) => `${d.relaciones} relaciones`);

    // Interacciones del nodo
    node
      .on("mouseover", function(event, d: any) {
        // Highlight del nodo
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("stroke-width", 4)
          .style("filter", "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))");

        // Mostrar tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "graph-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("z-index", "1000")
          .style("max-width", "250px")
          .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
          .html(`
            <div style="margin-bottom: 8px;"><strong>RUC:</strong> ${d.ruc}</div>
            <div style="margin-bottom: 8px;"><strong>Denominación:</strong> ${d.denominacion}</div>
            <div style="margin-bottom: 8px;"><strong>Total Relaciones:</strong> ${d.relaciones}</div>
            <div><strong>Rol:</strong> ${d.esMadre && d.esHija ? 'Madre/Hija' : d.esMadre ? 'Madre' : d.esHija ? 'Hija' : 'Sin relaciones'}</div>
          `);

        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        d3.select(".graph-tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))");

        d3.select(".graph-tooltip").remove();
      })
      .on("click", function(event, d: any) {
        setSelectedNode(selectedNode === d.id ? null : d.id);
      });

    // ✅ Actualizar posiciones en cada tick con verificaciones de nulidad
    simulation.on("tick", () => {
      // Actualizar posiciones de los enlaces
      link.select("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Actualizar posiciones de las etiquetas de los enlaces
      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      // ✅ Actualizar fondos de las etiquetas con verificaciones seguras
      link.select(".link-label-bg")
        .attr("x", function(d: any) {
          try {
            const currentElement = this as SVGElement | null;
            if (!currentElement || !currentElement.parentNode) {
              return (d.source.x + d.target.x) / 2;
            }
            
            const parentNode = currentElement.parentNode as Element;
            const labelElement = d3.select(parentNode).select(".link-label").node() as SVGTextElement | null;
            if (!labelElement) return (d.source.x + d.target.x) / 2;
            
            const bbox = labelElement.getBBox();
            return (d.source.x + d.target.x) / 2 - bbox.width / 2 - 2;
          } catch (e) {
            return (d.source.x + d.target.x) / 2;
          }
        })
        .attr("y", function(d: any) {
          try {
            const currentElement = this as SVGElement | null;
            if (!currentElement || !currentElement.parentNode) {
              return (d.source.y + d.target.y) / 2;
            }
            
            const parentNode = currentElement.parentNode as Element;
            const labelElement = d3.select(parentNode).select(".link-label").node() as SVGTextElement | null;
            if (!labelElement) return (d.source.y + d.target.y) / 2;
            
            const bbox = labelElement.getBBox();
            return (d.source.y + d.target.y) / 2 - bbox.height / 2 - 4;
          } catch (e) {
            return (d.source.y + d.target.y) / 2;
          }
        })
        .attr("width", function() {
          try {
            const currentElement = this as SVGElement | null;
            if (!currentElement || !currentElement.parentNode) {
              return 0;
            }
            
            const parentNode = currentElement.parentNode as Element;
            const labelElement = d3.select(parentNode).select(".link-label").node() as SVGTextElement | null;
            if (!labelElement) return 0;
            
            const bbox = labelElement.getBBox();
            return bbox.width + 4;
          } catch (e) {
            return 0;
          }
        })
        .attr("height", function() {
          try {
            const currentElement = this as SVGElement | null;
            if (!currentElement || !currentElement.parentNode) {
              return 0;
            }
            
            const parentNode = currentElement.parentNode as Element;
            const labelElement = d3.select(parentNode).select(".link-label").node() as SVGTextElement | null;
            if (!labelElement) return 0;
            
            const bbox = labelElement.getBBox();
            return bbox.height + 2;
          } catch (e) {
            return 0;
          }
        });

      // Actualizar posiciones de los nodos
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Auto-fit inicial con delay
    setTimeout(() => {
      fitBtn.dispatch("click");
    }, 1000);

    // Cleanup
    return () => {
      d3.select(".graph-tooltip").remove();
    };

  }, [data, selectedNode]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="border rounded bg-gray-50" style={{ width: '100%', height: '600px' }}></svg>
    </div>
  );
};

export default function CausasRelacionadasReporte() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [resumenData, setResumenData] = useState<ResumenData | null>(null);
  const [tiposRelacion, setTiposRelacion] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [vistaActual, setVistaActual] = useState<'detallado' | 'resumen'>('resumen');
  const [mostrarGrafo, setMostrarGrafo] = useState(false);
  
  // Filtros con valores iniciales consistentes
  const [filtros, setFiltros] = useState({
    tipoRelacion: 'all',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [causasExpandidas, setCausasExpandidas] = useState<Set<number>>(new Set());

  // ✅ Evitar hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Cargar tipos de relación disponibles con URL corregida
  useEffect(() => {
    if (!mounted) return;
    
    const fetchTiposRelacion = async () => {
      try {
        const response = await fetch('/api/reportes/causas-relacionadas', {
          method: 'OPTIONS'
        });
        
        if (response.ok) {
          const data = await response.json();
          setTiposRelacion(data.tiposRelacion || []);
        }
      } catch (error) {
        console.error('Error cargando tipos de relación:', error);
      }
    };

    fetchTiposRelacion();
  }, [mounted]);

  const fetchData = async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('formato', vistaActual);
      
      if (filtros.tipoRelacion && filtros.tipoRelacion !== 'all') {
        params.append('tipo_relacion', filtros.tipoRelacion);
      }
      if (filtros.fechaDesde) {
        params.append('fecha_desde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params.append('fecha_hasta', filtros.fechaHasta);
      }

      const response = await fetch(`/api/reportes/causas-relacionadas?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (vistaActual === 'resumen') {
        setResumenData(result);
        setData(null);
      } else {
        setData(result);
        setResumenData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar el reporte: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Cargar datos cuando cambie la vista (solo si está mounted)
  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [vistaActual, mounted]);

  const aplicarFiltros = () => {
    fetchData();
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoRelacion: 'all',
      fechaDesde: '',
      fechaHasta: ''
    });
    setTimeout(() => {
      fetchData();
    }, 100);
  };

  const exportarDatos = () => {
    const dataToExport = vistaActual === 'resumen' ? resumenData : data;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `causas-relacionadas-${vistaActual}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado exitosamente');
  };

  // ✅ Funciones para manejar expansión de causas
  const toggleCausaExpandida = (causaId: number) => {
    setCausasExpandidas(prev => {
      const nuevaSet = new Set(prev);
      if (nuevaSet.has(causaId)) {
        nuevaSet.delete(causaId);
      } else {
        nuevaSet.add(causaId);
      }
      return nuevaSet;
    });
  };

  const expandirTodas = () => {
    if (data) {
      const todasLasCausas = new Set(data.causas.map(causa => causa.id));
      setCausasExpandidas(todasLasCausas);
    }
  };

  const colapsarTodas = () => {
    setCausasExpandidas(new Set());
  };

  // ✅ Evitar hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Inicializando...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando reporte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8" />
            Reporte de Causas Relacionadas
          </h1>
          <p className="text-muted-foreground">
            Análisis de relaciones entre causas en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vistaActual === 'resumen' ? 'default' : 'outline'}
            onClick={() => setVistaActual('resumen')}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Resumen
          </Button>
          <Button
            variant={vistaActual === 'detallado' ? 'default' : 'outline'}
            onClick={() => setVistaActual('detallado')}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Detallado
          </Button>
          <Button onClick={exportarDatos} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo de Relación</label>
              <Select value={filtros.tipoRelacion} onValueChange={(value) => 
                setFiltros(prev => ({ ...prev, tipoRelacion: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposRelacion.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Fecha Desde</label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Fecha Hasta</label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Resumen */}
      {vistaActual === 'resumen' && resumenData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas con Relaciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.totalCausasConRelaciones}</div>
              <p className="text-xs text-muted-foreground">
                Total de causas relacionadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Relaciones</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.totalRelaciones}</div>
              <p className="text-xs text-muted-foreground">
                Vínculos establecidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas Madre</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.causasMadre}</div>
              <p className="text-xs text-muted-foreground">
                Con causas hijas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Causas Arista</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumenData.resumen.causasArista}</div>
              <p className="text-xs text-muted-foreground">
                Dependientes de otras
              </p>
            </CardContent>
          </Card>

          {/* Top Causas Madre */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top Causas con Más Relaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resumenData.resumen.topCausasMadre.map((causa, index) => (
                  <div key={causa.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">{causa.ruc || 'Sin RUC'}</span>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {causa.denominacionCausa}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {causa.totalRelaciones} relaciones
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipos de Relación */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tipos de Relación Más Comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resumenData.resumen.tiposRelacionMasComunes.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {tipo.tipoRelacion || 'Sin especificar'}
                    </span>
                    <Badge variant="outline">
                      {tipo._count.tipoRelacion}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vista Detallada */}
      {vistaActual === 'detallado' && data && (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{data.estadisticas.totalCausas}</div>
                <p className="text-sm text-muted-foreground">Causas con relaciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{data.estadisticas.totalRelaciones}</div>
                <p className="text-sm text-muted-foreground">Total de relaciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Causas Madre</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.causas.filter(causa => causa.totales.comoMadre > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Con causas hijas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Causas Hijas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.causas.filter(causa => causa.totales.comoHija > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dependientes de otras
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Causa con más relaciones:</div>
                <p className="text-sm text-muted-foreground">
                  {data.estadisticas.causaConMasRelaciones?.ruc || 'N/A'} 
                  ({data.estadisticas.causaConMasRelaciones?.totales.relacionesTotales || 0} relaciones)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Causas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Causas con Relaciones Detalladas</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={!mostrarGrafo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMostrarGrafo(false)}
                    className="text-xs"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Tabla
                  </Button>
                  <Button
                    variant={mostrarGrafo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMostrarGrafo(true)}
                    className="text-xs"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Grafo
                  </Button>
                  {!mostrarGrafo && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={expandirTodas}
                        className="text-xs"
                      >
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Expandir Todas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={colapsarTodas}
                        className="text-xs"
                      >
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Colapsar Todas
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mostrarGrafo ? (
                <div className="space-y-4">
                  {/* Leyenda del grafo */}
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <span className="text-sm">Solo Causa Madre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span className="text-sm">Solo Causa Hija</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <span className="text-sm">Ambos Roles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-500"></div>
                      <span className="text-sm">Sin Relaciones</span>
                    </div>
                    <div className="text-sm text-muted-foreground ml-4">
                      💡 Arrastra los nodos • Usa controles de zoom • Hover para más detalles • Click en "FIT VIEW" para ajustar
                    </div>
                  </div>
                  
                  {/* Grafo */}
                  <GrafoRelaciones data={data} />
                </div>
              ) : (
                // Tabla existente
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RUC</TableHead>
                      <TableHead>Denominación</TableHead>
                      <TableHead className="text-center">Como Madre</TableHead>
                      <TableHead className="text-center">Como Hija</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.causas.map((causa) => (
                      <>
                        <TableRow key={causa.id}>
                          <TableCell className="font-medium">{causa.ruc || 'Sin RUC'}</TableCell>
                          <TableCell className="max-w-xs truncate">{causa.denominacionCausa}</TableCell>
                          <TableCell className="text-center">{causa.totales.comoMadre}</TableCell>
                          <TableCell className="text-center">{causa.totales.comoHija}</TableCell>
                          <TableCell className="text-center font-medium">
                            {causa.totales.relacionesTotales}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCausaExpandida(causa.id)}
                            >
                              {causasExpandidas.has(causa.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Detalles expandidos */}
                        {causasExpandidas.has(causa.id) && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50">
                              <div className="p-4 space-y-4">
                                {/* Como Causa Madre */}
                                {causa.comoCausaMadre.total > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Como Causa Madre ({causa.comoCausaMadre.total}):</h4>
                                    <div className="space-y-2">
                                      {causa.comoCausaMadre.relaciones.map((rel) => (
                                        <div key={rel.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{rel.causaHija.ruc || 'Sin RUC'}</p>
                                              <p className="text-sm text-muted-foreground">{rel.causaHija.denominacionCausa}</p>
                                              {rel.observacion && (
                                                <p className="text-xs text-muted-foreground mt-1">{rel.observacion}</p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              {rel.tipoRelacion && (
                                                <Badge variant="outline" className="mb-1">{rel.tipoRelacion}</Badge>
                                              )}
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(rel.fechaRelacion).toLocaleDateString()}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Como Causa Hija */}
                                {causa.comoCausaHija.total > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Como Causa Hija ({causa.comoCausaHija.total}):</h4>
                                    <div className="space-y-2">
                                      {causa.comoCausaHija.relaciones.map((rel) => (
                                        <div key={rel.id} className="border-l-4 border-green-500 pl-4 py-2">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{rel.causaMadre.ruc || 'Sin RUC'}</p>
                                              <p className="text-sm text-muted-foreground">{rel.causaMadre.denominacionCausa}</p>
                                              {rel.observacion && (
                                                <p className="text-xs text-muted-foreground mt-1">{rel.observacion}</p>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              {rel.tipoRelacion && (
                                                <Badge variant="outline" className="mb-1">{rel.tipoRelacion}</Badge>
                                              )}
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(rel.fechaRelacion).toLocaleDateString()}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}