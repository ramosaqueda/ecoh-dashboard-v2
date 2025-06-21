// components/graph/hooks/useNodeSelection.tsx
import { useState } from 'react';
import { GraphNode } from '../types/graph.types';

export const useNodeSelection = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = async (node: GraphNode) => {
    try {
      if (node.type === 'organization') {
        const response = await fetch(`/api/organizacion/${node.org!.id}`);
        if (!response.ok) throw new Error('Error al cargar detalles');
        const data = await response.json();
        setSelectedNode({
          ...node,
          org: data
        });
      } else {
        setSelectedNode(node);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    selectedNode,
    handleNodeClick,
    clearSelection: () => setSelectedNode(null)
  };
};