'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, ZoomIn, Star, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Fotografia {
  id: number;
  url: string;
  filename: string;
  esPrincipal: boolean;
  createdAt: string;
}

interface ImageGalleryProps {
  images?: Fotografia[];
  title?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], title }) => {
  const validImages = images?.filter(img => img && img.url) || [];
  const [isClient, setIsClient] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Fotografia | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Limpiar estados cuando cambian las imágenes
    return () => {
      setLoadedImages(new Set());
      setErrorImages(new Set());
    };
  }, []);

  const getImageUrl = useCallback((url: string) => {
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  }, []);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleImageError = (index: number) => {
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    setErrorImages(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleImageClick = (image: Fotografia, index: number) => {
    if (!errorImages.has(index)) {
      setSelectedImage(image);
      setCurrentIndex(index);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = validImages.length - 1;
    // Saltar imágenes con error
    while (errorImages.has(newIndex) && newIndex !== currentIndex) {
      newIndex = newIndex - 1;
      if (newIndex < 0) newIndex = validImages.length - 1;
    }
    setCurrentIndex(newIndex);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    let newIndex = currentIndex + 1;
    if (newIndex >= validImages.length) newIndex = 0;
    // Saltar imágenes con error
    while (errorImages.has(newIndex) && newIndex !== currentIndex) {
      newIndex = newIndex + 1;
      if (newIndex >= validImages.length) newIndex = 0;
    }
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showModal) {
        if (e.key === 'ArrowLeft') handlePrevious();
        else if (e.key === 'ArrowRight') handleNext();
        else if (e.key === 'Escape') handleCloseModal();
      }
    };

    if (isClient) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isClient, showModal, currentIndex]);

  if (!validImages.length) {
    return (
      <div className="text-sm text-muted-foreground p-4 flex items-center justify-center gap-2">
        <ImageOff className="h-4 w-4" />
        No hay imágenes disponibles
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {validImages.map((image, index) => (
          <Card
            key={image.id}
            className={`relative aspect-square cursor-pointer overflow-hidden group ${
              errorImages.has(index) ? 'cursor-not-allowed' : ''
            }`}
            onClick={() => handleImageClick(image, index)}
          >
            {!loadedImages.has(index) && !errorImages.has(index) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
              </div>
            )}
            {errorImages.has(index) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2">
                <ImageOff className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Error al cargar</span>
              </div>
            ) : (
              <img
                src={getImageUrl(image.url)}
                alt={image.filename}
                className={`h-full w-full object-cover transition-all duration-300 ${
                  !loadedImages.has(index) ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:scale-105'
                }`}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                loading="eager"
              />
            )}
            {image.esPrincipal && !errorImages.has(index) && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Principal
                </Badge>
              </div>
            )}
            {!errorImages.has(index) && loadedImages.has(index) && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                <ZoomIn className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {isClient && (
        <Dialog 
          open={showModal} 
          onOpenChange={handleCloseModal}
        >
          <DialogContent 
            className="max-w-[90vw] max-h-[90vh]"
          >
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center justify-between">
                  <span>{title || 'Galería de fotos'}</span>
                  {validImages[currentIndex]?.esPrincipal && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Foto Principal
                    </Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            {validImages.length > 0 && (
              <div className="relative flex items-center justify-center p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 z-10 bg-white/80 hover:bg-white/90"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="relative h-[70vh] w-full flex items-center justify-center">
                  {validImages[currentIndex] && (
                    <>
                      {!loadedImages.has(currentIndex) && !errorImages.has(currentIndex) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        </div>
                      )}
                      {errorImages.has(currentIndex) ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <ImageOff className="h-12 w-12" />
                          <span>Error al cargar la imagen</span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(validImages[currentIndex].url)}
                          alt={validImages[currentIndex].filename}
                          className={`max-h-full max-w-full object-contain transition-all duration-300 ${
                            !loadedImages.has(currentIndex) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                          }`}
                          onLoad={() => handleImageLoad(currentIndex)}
                          onError={() => handleImageError(currentIndex)}
                          loading="eager"
                        />
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 z-10 bg-white/80 hover:bg-white/90"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {validImages.length}
              </span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};