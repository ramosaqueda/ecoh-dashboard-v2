// components/cards/HitoCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

interface TimelineHito {
  id: number;
  titulo: string;
  fecha: string;
  descripcion?: string;
  icono?: string;
  imagenUrl?: string;
  causaId: number;
  createdAt: string;
  updatedAt: string;
}

interface HitoCardProps {
  hito: TimelineHito;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HitoCard({ hito, onEdit, onDelete }: HitoCardProps) {
  // Render the icon dynamically based on the icon name
  const renderIcon = () => {
    if (!hito.icono) return null;
    
    const IconComponent = dynamic(
      () => import('lucide-react').then((mod) => mod[hito.icono as keyof typeof import('lucide-react')] as any),
      { ssr: false, loading: () => <div className="w-6 h-6" /> }
    );
    
    
    return (
      <div className="flex items-center justify-center h-6 w-6 text-primary">
        <IconComponent />
      </div>
    );


  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{hito.titulo.toString()}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {new Date(hito.fecha).toLocaleDateString('es-CL')}
            </div>
            {hito.icono && (
              <div>{renderIcon()}</div>
            )}
          </div>
          
          {hito.descripcion && (
            <p className="text-sm text-gray-600">{hito.descripcion}</p>
          )}
          
          {hito.imagenUrl && (
            <div className="relative h-32 w-full overflow-hidden rounded-md">
              <Image
                src={hito.imagenUrl}
                alt={hito.titulo.toString()}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}