import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useReactFlow, Panel } from 'reactflow';
import { toPng } from 'html-to-image';

function DownloadButton() {
  const { getNodes, getViewport } = useReactFlow();
  
  const downloadImage = () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    // Get all nodes and viewport
    const nodes = getNodes();
    const viewport = getViewport();

    // Get the flow wrapper element
    const flowWrapper = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowWrapper) return;

    // Calculate the actual dimensions of all nodes
    const xMin = Math.min(...nodes.map(node => node.position.x));
    const xMax = Math.max(...nodes.map(node => node.position.x + (node.width || 150)));
    const yMin = Math.min(...nodes.map(node => node.position.y));
    const yMax = Math.max(...nodes.map(node => node.position.y + (node.height || 40)));

    // Calculate dimensions with padding
    const padding = 50;
    const width = xMax - xMin + padding * 2;
    const height = yMax - yMin + padding * 2;

    // Calculate the scale to fit everything
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const scale = Math.min(
      elementWidth / width,
      elementHeight / height,
      1 // Limit scale to 1 to prevent too much zooming
    );

    // Calculate center position
    const centerX = (xMax + xMin) / 2;
    const centerY = (yMax + yMin) / 2;

    // Calculate transform
    const transform = [
      elementWidth / 2 - centerX * scale,
      elementHeight / 2 - centerY * scale,
      scale
    ];

    // Save current transform
    const currentTransform = flowWrapper.style.transform;

    // Apply temporary transform for screenshot
    flowWrapper.style.transform = `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`;

    toPng(element, {
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight,
      style: {
        width: elementWidth + 'px',
        height: elementHeight + 'px',
      },
      quality: 1,
    })
      .then((dataUrl) => {
        // Restore original transform
        flowWrapper.style.transform = currentTransform;

        const a = document.createElement('a');
        a.setAttribute('download', `organization-network-${Date.now()}.png`);
        a.setAttribute('href', dataUrl);
        a.click();
      })
      .catch((error) => {
        console.error('Error generating image:', error);
        // Restore original transform in case of error
        flowWrapper.style.transform = currentTransform;
      });
  };

  return (
    <Panel position="top-right" className="bg-transparent">
      <Button
        onClick={downloadImage}
        className="flex items-center gap-2"
        variant="secondary"
      >
        <Download className="h-4 w-4" />
        Descargar PNG
      </Button>
    </Panel>
  );
}

export default DownloadButton;