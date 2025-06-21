'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ComparisonResult from '@/components/ComparisonResult';
import { ComparisonResultType } from '@/types/compare';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleComparison = async (file1: File, file2: File) => {
    const formData = new FormData();
    setLoading(true);
    setProgress(0);

    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 500);

      const response = await fetch('/api/compare', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      setComparisonResult(result);

      clearInterval(interval);
      setProgress(100);
    } catch (error) {
      console.error('Error al comparar imágenes:', error);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Comparación de Fotos </h1>
      <FileUpload onCompare={handleComparison} />
      <Progress value={progress} className="w-[60%]" />
      {comparisonResult && <ComparisonResult result={comparisonResult} />}
    </main>
  );
}
