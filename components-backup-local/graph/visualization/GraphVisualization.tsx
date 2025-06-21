// components/graph/visualization/GraphVisualization.tsx
import { ForceGraph2D } from 'react-force-graph';
import { GraphData, GraphNode } from '../types/graph.types';

interface GraphVisualizationProps {
  graphData: GraphData;
  width: number;
  height: number;
  onNodeClick: (node: GraphNode) => void;
}

export const GraphVisualization = ({
  graphData,
  width,
  height,
  onNodeClick
}: GraphVisualizationProps) => {
  const renderNode = (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    
    // Dibujar forma según tipo
    const size = node.val;
    if (node.type === 'organization') {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, size/2, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
    } else {
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x! - size/2, node.y! - size/2, size, size);
    }
    
    // Dibujar etiqueta
    ctx.fillStyle = '#333';
    ctx.fillText(label, node.x!, node.y! + size);
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      width={width}
      height={height}
      nodeLabel="name"
      nodeColor={node => node.color}
      nodeVal={node => node.val}
      linkLabel={link => link.rol || ''}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={renderNode}
      onNodeClick={onNodeClick}
      linkColor={() => '#999'}
      linkWidth={1}
      enableNodeDrag={true}
      enableZoomInteraction={true}
    />
  );
};