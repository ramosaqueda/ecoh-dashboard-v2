'use client';

import { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Position,
  MarkerType,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';

const ReactFlow = dynamic(() => import('reactflow'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      Cargando grafo...
    </div>
  ),
});

// Interfaces de tipos
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

interface CausasGraphProps {
  causaId: string;
  relaciones: CausaRelacionada[];
  causaPrincipal: Causa;
}

interface FlowNode extends Node {
  data: {
    label: React.ReactNode;
  };
  position: {
    x: number;
    y: number;
  };
  className?: string;
  style?: React.CSSProperties;
  sourcePosition?: Position;
  targetPosition?: Position;
}

interface NodeLabelProps {
  ruc: string;
  denominacionCausa: string;
}

const nodeWidth = 250;
const nodeHeight = 80;

// Componente para el contenido del nodo
const NodeLabel: React.FC<NodeLabelProps> = ({ ruc, denominacionCausa }) => (
  <div className="p-2">
    <div className="font-medium text-sm">{ruc}</div>
    <div className="text-xs text-gray-600 truncate" title={denominacionCausa}>
      {denominacionCausa}
    </div>
  </div>
);

export default function CausasGraph({ causaId, relaciones, causaPrincipal }: CausasGraphProps) {
  // Crear nodos y enlaces iniciales
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: FlowNode[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    let currentLevel = 0;
    let nodesInCurrentLevel = 0;

    // Agregar nodo principal
    nodes.push({
      id: causaPrincipal.id.toString(),
      type: 'default',
      data: {
        label: (
          <NodeLabel 
            ruc={causaPrincipal.ruc}
            denominacionCausa={causaPrincipal.denominacionCausa}
          />
        )
      },
      position: { x: 0, y: 0 },
      className: 'bg-indigo-100 border-2 border-indigo-500 rounded-md',
      style: { width: nodeWidth, height: nodeHeight },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
    processedNodes.add(causaPrincipal.id.toString());

    // Procesar relaciones
    relaciones.forEach((rel) => {
      const sourceId = rel.causaMadre.id.toString();
      const targetId = rel.causaArista.id.toString();
      
      // Agregar nodos relacionados si no existen
      [rel.causaMadre, rel.causaArista].forEach(causa => {
        if (!processedNodes.has(causa.id.toString())) {
          currentLevel = causa.id === rel.causaMadre.id ? 1 : 2;
          nodes.push({
            id: causa.id.toString(),
            type: 'default',
            data: {
              label: (
                <NodeLabel 
                  ruc={causa.ruc}
                  denominacionCausa={causa.denominacionCausa}
                />
              )
            },
            position: {
              x: currentLevel * 300,
              y: nodesInCurrentLevel * 120
            },
            className: 'bg-green-100 border-2 border-green-500 rounded-md',
            style: { width: nodeWidth, height: nodeHeight },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          });
          processedNodes.add(causa.id.toString());
          nodesInCurrentLevel++;
        }
      });

      // Agregar enlace
      edges.push({
        id: `e${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: rel.observacion,
        type: 'smoothstep',
        animated: true,
        labelStyle: { fill: '#666', fontWeight: 500 },
        markerEnd: MarkerType.Arrow,
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [causaId, relaciones, causaPrincipal]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick: NodeMouseHandler = useCallback((event: React.MouseEvent, node: Node) => {
    // Extraer RUC del nodo de manera type-safe
    const nodeData = node.data as { label: React.ReactElement<NodeLabelProps> };
    const ruc = nodeData.label.props.ruc;
    
    if (process.env.NEXT_PUBLIC_FICHACASORUC) {
      window.open(`${process.env.NEXT_PUBLIC_FICHACASORUC}?ruc=${ruc}`, '_blank');
    }
  }, []);

  return (
    <Card className="p-4">
      <div style={{ width: '100%', height: '600px' }}>
        {typeof window !== 'undefined' && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            fitView
            attributionPosition="bottom-left"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </Card>
  );
}