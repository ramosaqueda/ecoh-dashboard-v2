// components/graphs/CausasTreeGraph.tsx
'use client';

import { useMemo } from 'react';
import Tree from 'react-d3-tree';

interface TreeNode {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
}

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

interface CausasTreeGraphProps {
  causaId: string;
  relaciones: CausaRelacionada[];
  causaPrincipal: Causa;
}

export default function CausasTreeGraph({
  causaId,
  relaciones,
  causaPrincipal
}: CausasTreeGraphProps) {
  const treeData = useMemo(() => {
    // Crear un mapa de causas hijas por causa madre
    const childrenMap = new Map<string, CausaRelacionada[]>();
    
    relaciones.forEach(rel => {
      const madreId = rel.causaMadre.id.toString();
      if (!childrenMap.has(madreId)) {
        childrenMap.set(madreId, []);
      }
      childrenMap.get(madreId)?.push(rel);
    });

    // Función recursiva para construir el árbol
    const buildNode = (causa: Causa): TreeNode => {
      const id = causa.id.toString();
      const children = childrenMap.get(id) || [];
      
      return {
        name: causa.ruc,
        attributes: {
          denominacion: causa.denominacionCausa
        },
        children: children.map(rel => buildNode(rel.causaArista))
      };
    };

    // Construir el árbol desde la causa principal
    return buildNode(causaPrincipal);
  }, [causaId, relaciones, causaPrincipal]);

  const renderForeignObjectNode = ({
    nodeDatum,
    foreignObjectProps
  }: {
    nodeDatum: any;
    foreignObjectProps: any;
  }) => (
    <g>
      <circle r={15} fill="#4f46e5" />
      <foreignObject {...foreignObjectProps}>
        <div className="flex flex-col items-start p-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <span className="font-medium text-sm text-gray-900">{nodeDatum.name}</span>
          <span className="text-xs text-gray-600 max-w-[200px] truncate">
            {nodeDatum.attributes?.denominacion}
          </span>
        </div>
      </foreignObject>
    </g>
  );

  return (
    <div className="h-[600px] w-full bg-white">
      <Tree
        data={treeData}
        orientation="vertical"
        pathFunc="step"
        nodeSize={{ x: 250, y: 100 }}
        separation={{ siblings: 2, nonSiblings: 2.5 }}
        renderCustomNodeElement={(rd3tProps) =>
          renderForeignObjectNode({
            ...rd3tProps,
            foreignObjectProps: {
              width: 220,
              height: 60,
              x: -110,
              y: -30,
            },
          })
        }
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
      <style jsx global>{`
        .node__root circle {
          fill: #4f46e5;
        }
        .node__branch circle {
          fill: #22c55e;
        }
        .node__leaf circle {
          fill: #22c55e;
        }
        .rd3t-link {
          stroke: #94a3b8;
          stroke-width: 2;
        }
      `}</style>
    </div>
  );
}