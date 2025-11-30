'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import TelefonoNetworkGraph from '@/components/graph/TelefonoNetworkGraph';

export default function TelefonoGrafoPage() {
  return (
    <div className="space-y-6 p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Share2 className="h-8 w-8 text-blue-600" />
            Grafo de Interconexión
          </h1>
          <p className="text-muted-foreground">
            Visualización de relaciones entre Causas y Teléfonos
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <TelefonoNetworkGraph />
      </div>
    </div>
  );
}