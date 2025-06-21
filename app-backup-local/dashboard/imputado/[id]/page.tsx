// app/dashboard/imputado/[id]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import ImputadoPhotos from '@/components/forms/ImputadoForm/ImputadoPhotos';
import ImputadoPdfGenerator from '@/components/ImputadoPdfGenerator';
import { use, Suspense } from 'react'; // ✅ Importar use de React

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ImputadoDetail, type CausaImputado } from '@/types/imputado';

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

// ✅ Componente interno que maneja los datos
function ImputadoDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // ✅ Usar use() para obtener los parámetros de la Promise
  const { id } = use(params);

  const { data: imputado, isLoading } = useQuery<ImputadoDetail>({
    queryKey: ['imputado-detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/imputado/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar datos del imputado');
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

  if (!imputado) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">Imputado no encontrado</p>
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
              {imputado.nombreSujeto}
            </h1>
            <p className="text-muted-foreground">Detalles del imputado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ImputadoPdfGenerator imputadoData={imputado} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Datos Personales */}
        <div className="rounded-lg border p-6 print:border-none">
          <h2 className="text-lg font-semibold">Datos Personales</h2>
          <Separator className="my-4" />
          <dl className="space-y-2">
            <DetailRow label="Nombre" value={imputado.nombreSujeto} />
            <DetailRow label="RUN" value={imputado.docId} />
            <DetailRow
              label="Nacionalidad"
              value={imputado.nacionalidad?.nombre}
            />
            <DetailRow
              label="Fecha de registro"
              value={
                imputado.createdAt
                  ? format(
                      new Date(imputado.createdAt),
                      "d 'de' MMMM 'de' yyyy",
                      {
                        locale: es
                      }
                    )
                  : null
              }
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
              value={imputado.causas?.length || 0}
            />
            <DetailRow
              label="Causas formalizadas"
              value={imputado.causas?.filter((c) => c.formalizado).length || 0}
            />
            <DetailRow
              label="Como imputado"
              value={imputado.causas?.filter((c) => c.esimputado).length || 0}
            />
            <DetailRow
              label="Como sujeto de interés"
              value={
                imputado.causas?.filter((c) => c.essujetoInteres).length || 0
              }
            />
          </dl>
        </div>

        {/* Fotografías */}
        <div className="lg:col-span-2 print:hidden">
          <div className="rounded-lg border p-6">
            <ImputadoPhotos imputadoId={id} />
          </div>
        </div>

        {/* Causas Asociadas */}
        <div className="lg:col-span-2 print:break-before-page">
          <div className="rounded-lg border p-6 print:border-none">
            <h2 className="text-lg font-semibold">Causas Asociadas</h2>
            <Separator className="my-4" />
            {imputado.causas && imputado.causas.length > 0 ? (
              <div className="divide-y">
                {imputado.causas.map((causa: CausaImputado) => (
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
                        <div className="flex flex-wrap gap-2">
                          {causa.formalizado && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 print:border print:border-blue-700">
                              Formalizado
                            </span>
                          )}
                          {causa.esimputado && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 print:border print:border-amber-700">
                              Imputado
                            </span>
                          )}
                          {causa.essujetoInteres && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 print:border print:border-purple-700">
                              Sujeto de interés
                            </span>
                          )}
                          {causa.causa.delito && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 print:border print:border-gray-700">
                              {causa.causa.delito.nombre}
                            </span>
                          )}
                        </div>
                        {causa.causa.tribunal && (
                          <p className="text-sm text-muted-foreground">
                            {causa.causa.tribunal.nombre}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {causa.fechaFormalizacion && (
                          <div className="text-sm text-muted-foreground">
                            Formalizado el{' '}
                            {format(
                              new Date(causa.fechaFormalizacion),
                              "d 'de' MMMM 'de' yyyy",
                              { locale: es }
                            )}
                          </div>
                        )}
                        {causa.plazo && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Plazo: {causa.plazo} días
                          </div>
                        )}
                      </div>
                    </div>
                    {causa.cautelar && (
                      <div className="mt-2">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 print:border print:border-green-700">
                          Medida cautelar: {causa.cautelar.nombre}
                        </span>
                      </div>
                    )}
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

// ✅ Componente principal con Suspense
export default function ImputadoDetailPage({
  params
}: {
  params: Promise<{ id: string }>; // ✅ Cambio: params es Promise
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ImputadoDetailContent params={params} />
    </Suspense>
  );
}