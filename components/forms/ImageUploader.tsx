// components/forms/ImageUploader.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
}

export function ImageUploader({ currentImageUrl, onImageUploaded }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Update the preview and notify parent component
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-md border border-gray-200">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-dashed border-gray-300 p-4">
          <div className="text-center">
            <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-1 text-sm text-gray-500">
              Sube una imagen para el hito
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {previewUrl ? 'Cambiar imagen' : 'Subir imagen'}
            </span>
          </Button>
        </label>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            className="text-red-500"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}