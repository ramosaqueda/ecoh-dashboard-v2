'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Background, 
  Controls, 
  
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,        // ✅ IMPORTAR Connection
  MarkerType,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DownloadButton from '@/components/DownloadButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import CustomNode from './CustomNode';
import { DetailPanel } from '@/components/graph/detail/DetailPanel';

const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.default),
  { ssr: false }
);

interface OrganizationNetworkReactFlowProps {
  organizationId: string;
}

const nodeTypes = {
  custom: CustomNode,
};

const OrganizationNetworkReactFlow = ({ organizationId }: OrganizationNetworkReactFlowProps) => {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [organizacion, setOrganizacion] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/organizacion/${organizationId}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const data = await response.json();
        setOrganizacion(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos de la organización');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  const processData = useCallback((org: any) => {
    if (!org) return { nodes: [], edges: [] };

    const processedNodes: Node[] = [];
    const processedEdges: Edge[] = [];

    // Nodo central de la organización
    processedNodes.push({
      id: `org-${org.id}`,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        name: org.nombre,
        role: org.tipoOrganizacion?.nombre || 'Organización',
        emoji: '🏢',
        type: 'organization',
        org: org // Aseguramos pasar el objeto completo para el DetailPanel
      }
    });

    // Procesar miembros
    if (org.miembros && org.miembros.length > 0) {
      const radius = 300;
      const angleStep = (2 * Math.PI) / org.miembros.length;

      org.miembros.forEach((member: any, index: number) => {
        if (member.imputado) {
          const angle = index * angleStep;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          const imputadoId = `imp-${member.imputadoId}`;
          
          // Verificar si el imputado tiene foto principal
          const hasPhoto = member.imputado.fotoPrincipal ? true : false;
          
          processedNodes.push({
            id: imputadoId,
            type: 'custom',
            position: { x, y },
            data: {
              name: member.imputado.nombreSujeto,
              role: member.rol || 'Miembro',
              emoji: '👤',
              type: 'imputado',
              imputado: member.imputado, // Pasar objeto completo
              photoUrl: hasPhoto ? member.imputado.fotoPrincipal : null // Añadir URL de foto si existe
            }
          });

          processedEdges.push({
            id: `e-${org.id}-${member.imputadoId}`,
            source: `org-${org.id}`,
            target: imputadoId,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            style: { stroke: '#2563eb', strokeWidth: 2 }
          });
        }
      });
    }
    
    // Procesar causas asociadas - NUEVO
    if (org.causas && org.causas.length > 0) {
      const radiusCausas = 400; // Radio mayor para situar las causas
      
      // Determinar si vamos a colocar las causas en un semicírculo inferior
      // o en un círculo completo si hay muchas causas
      const useSemicircle = org.causas.length <= 5;
      const startAngle = useSemicircle ? Math.PI : 0; // Comienza desde abajo si es semicírculo
      const endAngle = useSemicircle ? 2 * Math.PI : 2 * Math.PI; // Completa el círculo
      const angleStep = (endAngle - startAngle) / org.causas.length;
      
      org.causas.forEach((causa: any, index: number) => {
        // Calcular posición en círculo o semicírculo
        const angle = startAngle + (index * angleStep);
        const x = radiusCausas * Math.cos(angle);
        const y = radiusCausas * Math.sin(angle);
        
        const causaId = `causa-${causa.id}`;
        
        processedNodes.push({
          id: causaId,
          type: 'custom',
          position: { x, y },
          data: {
            name: causa.causa?.denominacionCausa || 'Causa sin nombre',
            role: causa.causa?.ruc || 'Sin RUC',
            emoji: '📋',
            type: 'causa',
            causa: causa.causa, // Pasar objeto completo para DetailPanel
            delito: causa.causa?.delito?.nombre // Añadir nombre del delito si existe
          }
        });
        
        processedEdges.push({
          id: `e-${org.id}-causa-${causa.id}`,
          source: `org-${org.id}`,
          target: causaId,
          type: 'smoothstep',
          animated: true,
          label: 'Asociada',
          labelStyle: { fill: '#f97316', fontWeight: 500 },
          markerEnd: {
            type: MarkerType.Arrow,
          },
          style: { stroke: '#f97316', strokeWidth: 2 } // Color naranja para diferenciar
        });
      });
    }

    return { nodes: processedNodes, edges: processedEdges };
  }, []);

  useEffect(() => {
    if (organizacion) {
      try {
        const { nodes, edges } = processData(organizacion);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Error processing data:', error);
        setError('Error al procesar los datos');
      }
    }
  }, [organizacion, processData]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),  // ✅ Tipado correcto
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[800px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"/>
        <span className="ml-2">Cargando datos...</span>
      </div>
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
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {organizacion?.nombre}
          {/* Añadir contador de causas */}
          {organizacion?.causas && organizacion.causas.length > 0 && (
            <span className="ml-2 text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              <FileText className="inline-block h-4 w-4 mr-1" />
              {organizacion.causas.length} Causas
            </span>
          )}
        </h1>
      </div>

      <div className="h-[800px] w-full border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="react-flow"
          minZoom={0.1}
          maxZoom={4}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <DownloadButton />
        </ReactFlow>
      </div>

      <DetailPanel 
        node={selectedNode?.data} 
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default OrganizationNetworkReactFlow;