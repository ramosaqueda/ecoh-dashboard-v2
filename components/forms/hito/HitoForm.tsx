// components/forms/hito/HitoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { IconPicker } from '@/components/forms/IconPicker';
import { ImageUploader } from '@/components/forms/ImageUploader';

interface HitoFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData: {
    id?: number;
    titulo: string;
    fecha: string;
    descripcion?: string;
    icono?: string;
    imagenUrl?: string;
  } | null;
}

export default function HitoForm({
  onSubmit,
  isSubmitting,
  initialData
}: HitoFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    icono: '',
    imagenUrl: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        fecha: initialData.fecha || new Date().toISOString().split('T')[0],
        descripcion: initialData.descripcion || '',
        icono: initialData.icono || '',
        imagenUrl: initialData.imagenUrl || ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icono: icon }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imagenUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid w-full items-center gap-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
          placeholder="Ingrese el título del hito"
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="fecha">Fecha *</Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Ingrese una descripción del hito"
          rows={3}
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label>Icono</Label>
        <IconPicker 
          selectedIcon={formData.icono} 
          onSelectIcon={handleIconSelect} 
        />
      </div>

      <div className="grid w-full items-center gap-2">
        <Label>Imagen</Label>
        <ImageUploader 
          currentImageUrl={formData.imagenUrl}
          onImageUploaded={handleImageUpload}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}