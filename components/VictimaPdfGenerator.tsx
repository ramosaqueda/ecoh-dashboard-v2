// components/VictimaPdfGenerator.tsx
'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { type VictimaDetail } from '@/types/victima';

interface VictimaPdfGeneratorProps {
  victimaData: VictimaDetail;
}

export default function VictimaPdfGenerator({ victimaData }: VictimaPdfGeneratorProps) {
  const handleGeneratePdf = () => {
    // Implementación simple usando window.print()
    // En una implementación más robusta podrías usar librerías como jsPDF o react-to-pdf
    window.print();
  };

  const handlePrintPage = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrintPage}
        className="gap-2 print:hidden"
      >
        <FileText className="h-4 w-4" />
        Imprimir/PDF
      </Button>
    </div>
  );
}