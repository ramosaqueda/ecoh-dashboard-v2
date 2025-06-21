// components/forms/VictimaForm/VictimaPhotos.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Star, StarOff, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

interface Fotografia {
  id: number;
  url: string;
  filename: string;
  esPrincipal: boolean;
  createdAt: string;
}

interface VictimaPhotosProps {
  victimaId: string;
}

export default function VictimaPhotos({ victimaId }: VictimaPhotosProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: fotografias = [], isLoading } = useQuery<Fotografia[]>({
    queryKey: ['victima-fotografias', victimaId],
    queryFn: async () => {
      const response = await fetch(`/api/victima/${victimaId}/fotografias`);
      if (!response.ok) {
        throw new Error('Error al cargar las fotografías');
      }
      return response.json();
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/victima/${victimaId}/fotografias`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir las fotografías');
      }

      toast.success('Fotografías subidas exitosamente');
      queryClient.invalidateQueries({
        queryKey: ['victima-fotografias', victimaId]
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir las fotografías');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrincipal = async (fotografiaId: number) => {
    try {
      const response = await fetch(
        `/api/victima/${victimaId}/fotografias/${fotografiaId}/principal`,
        {
          method: 'PATCH'
        }
      );

      if (!response.ok) {
        throw new Error('Error al establecer fotografía principal');
      }

      toast.success('Fotografía principal actualizada');
      queryClient.invalidateQueries({
        queryKey: ['victima-fotografias', victimaId]
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al establecer fotografía principal');
    }
  };

  const handleDelete = async (fotografiaId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta fotografía?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/victima/${victimaId}/fotografias/${fotografiaId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar la fotografía');
      }

      toast.success('Fotografía eliminada exitosamente');
      queryClient.invalidateQueries({
        queryKey: ['victima-fotografias', victimaId]
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la fotografía');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotografías
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Subiendo...' : 'Subir fotografías'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando fotografías...</p>
          </div>
        ) : fotografias.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay fotografías</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotografias.map((foto) => (
              <div
                key={foto.id}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="aspect-square relative">
                  <Image
                    src={foto.url}
                    alt={foto.filename}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {foto.esPrincipal && (
                  <div className="absolute top-2 left-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetPrincipal(foto.id)}
                    disabled={foto.esPrincipal}
                    title={foto.esPrincipal ? 'Fotografía principal' : 'Establecer como principal'}
                  >
                    {foto.esPrincipal ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(foto.id)}
                    title="Eliminar fotografía"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-2 bg-white">
                  <p className="text-xs text-muted-foreground truncate">
                    {foto.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}