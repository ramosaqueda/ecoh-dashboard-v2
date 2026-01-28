'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useFichabSession } from '@/components/fichab/FichabSessionConfig';
import { Camera, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface FichabFotoButtonProps {
  rut: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: React.ReactNode;
}

export const FichabFotoButton = ({ 
  rut, 
  className, 
  variant = "outline", 
  size = "default",
  label = "Ver Foto SRCI"
}: FichabFotoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fichabSession = useFichabSession();

  const handleConsultar = async () => {
    if (!fichabSession) {
      toast({
        variant: 'destructive',
        title: 'FICHAB no configurado',
        description: 'Configure su sesión FICHAB en el ícono del header'
      });
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);
    setPhotoData(null);

    try {
      const response = await fetch('/api/fichab/foto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rut, 
          ciSession: fichabSession.ciSession, 
          serverId: fichabSession.serverId 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al consultar Foto FICHAB');
      }

      if (result.success && result.data) {
        setPhotoData(result.data);
      } else {
        throw new Error('No se encontró fotografía para este RUT');
      }

    } catch (err: any) {
      console.error('Error fetching Ficha B Foto:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => {
              e.stopPropagation();
              handleConsultar();
          }}
          title="Ver Foto Registro Civil"
      >
          <Camera className="h-4 w-4 mr-2" />
          {label}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fotografía Registro Civil - RUN {rut}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Obteniendo fotografía...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-2 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p>{error}</p>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open('https://balanceador-qa.minpublico.cl/fichab', '_blank')}
                >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ir a FICHAB
                </Button>
              </div>
            ) : photoData ? (
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border bg-black/5">
                {/* La data viene como string base64 completo incluyendo el prefijo data:image... */}
                <Image
                  src={photoData}
                  alt={`Foto RUN ${rut}`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
