// app/dashboard/victima/[id]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import VictimaPhotos from '@/components/forms/VictimaForm/VictimaPhotos';
import VictimaPdfGenerator from '@/components/VictimaPdfGenerator';
import { use, Suspense } from 'react';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type VictimaDetail, type CausaVictima } from '@/types/victima';

interface DetailField {
  label: string;
  value: string | number | null | undefined;
}

const DetailRow = ({ label, value }: DetailField) => (
  <div className="grid grid-cols-3 gap-4 py-3">
    <dt className="font-medium text-gray-500">{label}</dt>
    <dd className="col-span-2 text-gray-900">{value || '-'}</dd>
  </div>
);

// Componente interno que maneja los datos
function VictimaDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Usar use() para obtener los parámetros de la Promise
  const { id } = use(params);

  const { data: victima, isLoading } = useQuery<VictimaDetail>({
    queryKey: ['victima-detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/victima/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar datos de la víctima');
      }
      return response.json();
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!victima) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">Víctima no encontrada</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {victima.nombreVictima}
            </h1>
            <p className="text-muted-foreground">Detalles de la víctima</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VictimaPdfGenerator victimaData={victima} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Datos Personales */}
        <div className="rounded-lg border p-6 print:border-none">
          <h2 className="text-lg font-semibold">Datos Personales</h2>
          <Separator className="my-4" />
          <dl className="space-y-2">
            <DetailRow label="Nombre" value={victima.nombreVictima} />
            <DetailRow label="RUN" value={victima.docId} />
            <DetailRow
              label="Nacionalidad"
              value={victima.nacionalidad?.nombre}
            />
            
          </dl>
        </div>

        {/* Estadísticas */}
        <div className="rounded-lg border p-6 print:border-none">
          <h2 className="text-lg font-semibold">Estadísticas</h2>
          <Separator className="my-4" />
          <dl className="space-y-2">
            <DetailRow
              label="Total de causas"
              value={victima.causas?.length || 0}
            />
             
           
          </dl>
        </div>

        {/* Fotografías */}
        <div className="lg:col-span-2 print:hidden">
          <div className="rounded-lg border p-6">
            <VictimaPhotos victimaId={id} />
          </div>
        </div>

        {/* Causas Asociadas */}
        <div className="lg:col-span-2 print:break-before-page">
          <div className="rounded-lg border p-6 print:border-none">
            <h2 className="text-lg font-semibold">Causas Asociadas</h2>
            <Separator className="my-4" />
            {victima.causas && victima.causas.length > 0 ? (
              <div className="divide-y">
                {victima.causas.map((causa: CausaVictima) => (
                  <div key={causa.causaId} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {causa.causa.ruc || 'RUC no disponible'}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm">
                            {causa.causa.denominacionCausa}
                          </span>
                        </div>
                        
                        {causa.causa.tribunal && (
                          <p className="text-sm text-muted-foreground">
                            {causa.causa.tribunal.nombre}
                          </p>
                        )}
                      </div>
                      
                    </div>
                 
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No hay causas asociadas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie de página para impresión */}
      <div className="hidden print:fixed print:bottom-0 print:left-0 print:block print:w-full print:border-t print:py-4 print:text-center print:text-sm print:text-gray-500">
        <p>
          Documento generado el{' '}
          {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
            locale: es
          })}
        </p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function VictimaDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VictimaDetailContent params={params} />
    </Suspense>
  );
}