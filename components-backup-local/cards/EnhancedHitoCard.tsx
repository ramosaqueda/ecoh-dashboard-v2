// components/cards/EnhancedHitoCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

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

interface EnhancedHitoCardProps {
  hito: TimelineHito;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EnhancedHitoCard({ hito, onEdit, onDelete }: EnhancedHitoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const formattedDate = new Date(hito.fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            {hito.icono && (
              <div className="rounded-full bg-primary/10 p-2">
                {renderIcon()}
              </div>
            )}
            <div>
              <h3 className="font-medium">{hito.titulo.toString()}</h3>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 p-4">
                {hito.descripcion && (
                  <p className="text-sm text-gray-600 mb-4">{hito.descripcion}</p>
                )}
                
                {hito.imagenUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-md">
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}