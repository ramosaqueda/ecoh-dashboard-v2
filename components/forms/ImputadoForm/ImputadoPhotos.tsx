import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface Photo {
  id: number;
  url: string;
  filename: string;
  esPrincipal: boolean;
  createdAt: string;
}

interface ImputadoPhotosProps {
  imputadoId?: string;
}

const ImputadoPhotos = ({ imputadoId }: ImputadoPhotosProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const queryClient = useQueryClient();

  // Query para cargar las fotos existentes
  const {
    data: photos = [],
    isLoading,
    error
  } = useQuery<Photo[]>({
    queryKey: ['imputado-photos', imputadoId],
    queryFn: async () => {
      if (!imputadoId) return [];
      const response = await fetch(`/api/imputado/${imputadoId}/photos`);
      if (!response.ok) {
        throw new Error('Error al cargar las fotos');
      }
      return response.json();
    },
    enabled: !!imputadoId
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !imputadoId) return;

    // Verificar límite de fotos
    if (photos.length + files.length > 4) {
      toast.error('No se pueden subir más de 4 fotos por imputado');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/imputado/${imputadoId}/photos`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Error al subir la foto');
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Recargar las fotos después de la subida
      queryClient.invalidateQueries({
        queryKey: ['imputado-photos', imputadoId]
      });
      toast.success('Fotos subidas exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir las fotos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Limpiar el input file
      event.target.value = '';
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!imputadoId) return;

    try {
      const response = await fetch(
        `/api/imputado/${imputadoId}/photos/${photoId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }

      // Recargar las fotos después de eliminar
     // queryClient.invalidateQueries(['imputado-photos', imputadoId]);
      queryClient.refetchQueries({
        queryKey: ['imputado-photos', imputadoId]
      });
      toast.success('Foto eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la foto');
    }
  };

  const handleSetPrincipal = async (photoId: number) => {
    if (!imputadoId) return;

    try {
      const response = await fetch(
        `/api/imputado/${imputadoId}/photos/${photoId}/principal`,
        {
          method: 'PUT'
        }
      );

      if (!response.ok) {
        throw new Error('Error al establecer la foto principal');
      }

      // Recargar las fotos después de actualizar
     // queryClient.invalidateQueries(['imputado-photos', imputadoId]);
      queryClient.refetchQueries({
        queryKey: ['imputado-photos', imputadoId]
      });
      toast.success('Foto principal actualizada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al establecer la foto principal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-center text-destructive">
        Error al cargar las fotos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Fotografías ({photos.length}/4)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="photo-upload"
            onChange={handleFileSelect}
            disabled={isUploading || !imputadoId || photos.length >= 4}
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              asChild
              disabled={isUploading || !imputadoId || photos.length >= 4}
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir fotos
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {isUploading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.url}
              alt={photo.filename}
              fill
              className="object-cover transition-transform duration-200 hover:scale-105"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 16vw"
            />
            <div className="absolute inset-0 flex items-start justify-end gap-2 bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {!photo.esPrincipal && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetPrincipal(photo.id);
                  }}
                  title="Establecer como principal"
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                title="Eliminar foto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {photo.esPrincipal && (
              <div className="absolute left-1 top-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] text-white">
                Principal
              </div>
            )}
          </div>
        ))}
      </div>

      {photos.length === 0 && !isUploading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay fotos cargadas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Máximo 4 fotos por imputado
          </p>
        </div>
      )}

      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedPhoto?.esPrincipal && (
                  <span className="mr-2 inline-flex items-center rounded-full bg-primary/90 px-2 py-1 text-xs text-white">
                    Principal
                  </span>
                )}
                {selectedPhoto?.filename}
              </span>
              <div className="flex gap-2">
                {selectedPhoto && !selectedPhoto.esPrincipal && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      handleSetPrincipal(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                  >
                    <Star className="h-4 w-4" />
                    Establecer como principal
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (selectedPhoto) {
                      handleDelete(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-lg">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImputadoPhotos;
