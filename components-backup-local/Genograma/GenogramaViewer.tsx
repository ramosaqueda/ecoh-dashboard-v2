'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import mermaid from 'mermaid';

interface GenogramaViewerProps {
  mermaidCode: string;
}

export const GenogramaViewer: React.FC<GenogramaViewerProps> = ({ mermaidCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar mermaid con las opciones adecuadas
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      securityLevel: 'loose',
    });
  }, []);

  // Renderizar el diagrama cuando el código cambia
  useEffect(() => {
    if (mermaidCode && containerRef.current) {
      try {
        containerRef.current.innerHTML = '';
        mermaid.render('genograma-svg', mermaidCode).then((result) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = result.svg;
          }
        });
      } catch (error) {
        console.error('Error al renderizar el genograma:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div class="text-red-500">Error al renderizar el genograma. Por favor, revise la sintaxis.</div>';
        }
      }
    } else if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="text-slate-500 italic">Genere el genograma para visualizarlo aquí.</div>';
    }
  }, [mermaidCode]);

  // Función para abrir en nueva ventana
  const handleOpenInNewWindow = () => {
    if (!mermaidCode) return;

    const svgCode = containerRef.current?.innerHTML || '';
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Genograma - Vista Completa</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
              }
              .container {
                width: 100%;
                overflow: auto;
                display: flex;
                justify-content: center;
              }
              .btn-container {
                margin-top: 20px;
              }
              button {
                padding: 8px 16px;
                background-color: #0070f3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
              button:hover {
                background-color: #0051a8;
              }
            </style>
          </head>
          <body>
            <h1>Genograma Familiar - Vista Completa</h1>
            <div class="container">
              ${svgCode}
            </div>
            <div class="btn-container">
              <button onclick="window.print()">Imprimir</button>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {mermaidCode && (
        <div className="flex justify-end">
          <Button 
            onClick={handleOpenInNewWindow} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Ver en pantalla completa
          </Button>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="border rounded-md p-4 min-h-[300px] flex items-center justify-center"
      >
        <div className="text-slate-500 italic">Genere el genograma para visualizarlo aquí.</div>
      </div>
    </div>
  );
};