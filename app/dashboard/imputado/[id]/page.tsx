// app/dashboard/imputado/[id]/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, 
  ArrowLeft, 
  User, 
  FileText, 
  Scale, 
  Calendar,
  Flag,
  Users,
  Camera,
  BadgeCheck,
  UserX,
  Eye,
  Gavel,
  Clock,
  Shield,
  Fingerprint,
  BookUser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import ImputadoPhotos from '@/components/forms/ImputadoForm/ImputadoPhotos';
import ImputadoPdfGenerator from '@/components/ImputadoPdfGenerator';
import { use, Suspense } from 'react';
import { FichabFotoButton } from '@/components/fichab/FichabFotoButton';
import Link from 'next/link';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ImputadoDetail, type CausaImputado } from '@/types/imputado';

// Componente para mostrar un campo de información con icono
const InfoField = ({ 
  icon: Icon, 
  label, 
  value, 
  badge = false,
  badgeVariant = 'default',
  className = ''
}: { 
  icon?: any; 
  label: string; 
  value: string | number | null | undefined;
  badge?: boolean;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors ${className}`}>
    {Icon && (
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#004388]/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-[#004388]" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      {badge ? (
        <Badge variant={badgeVariant} className="mt-1">
          {value || '-'}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-slate-900 mt-0.5">{value || '-'}</p>
      )}
    </div>
  </div>
);

// Componente para estadísticas
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = 'blue' 
}: { 
  icon: any; 
  label: string; 
  value: number;
  color?: 'blue' | 'amber' | 'purple' | 'green';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${colorClasses[color]} transition-transform hover:scale-[1.02]`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color === 'blue' ? 'bg-blue-100' : color === 'amber' ? 'bg-amber-100' : color === 'purple' ? 'bg-purple-100' : 'bg-green-100'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
};

// Componente interno que maneja los datos
function ImputadoDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
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
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#004388]" />
      </div>
    );
  }

  if (!imputado) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <User className="h-16 w-16 text-slate-300" />
        <p className="text-slate-600">Imputado no encontrado</p>
        <Button onClick={() => router.back()} variant="outline">Volver</Button>
      </div>
    );
  }

  // Calcular estadísticas
  const totalCausas = imputado.causas?.length || 0;
  const causasFormalizadas = imputado.causas?.filter((c) => c.formalizado).length || 0;
  const comoImputado = imputado.causas?.filter((c) => c.esimputado).length || 0;
  const comoSujetoInteres = imputado.causas?.filter((c) => c.essujetoInteres).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full shadow-sm hover:shadow-md transition-shadow print:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-4">
                {/* Avatar con inicial */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#004388] to-[#0066cc] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {imputado.nombreSujeto?.charAt(0).toUpperCase() || 'I'}
                </div>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    {imputado.nombreSujeto}
                  </h1>
                  {imputado.alias && (
                    <p className="text-lg text-slate-600 italic">
                      &quot;{imputado.alias}&quot;
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 font-mono text-sm">
                      RUN: {imputado.docId || 'No registrado'}
                    </span>
                    {imputado.nacionalidad && (
                      <Badge variant="outline" className="text-xs">
                        <Flag className="h-3 w-3 mr-1" />
                        {imputado.nacionalidad.nombre}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 print:hidden">
              {imputado.docId && (
                <FichabFotoButton 
                  rut={imputado.docId} 
                  variant="outline"
                />
              )}
              <ImputadoPdfGenerator imputadoData={imputado} />
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={Scale} 
            label="Total Causas" 
            value={totalCausas} 
            color="blue" 
          />
          <StatCard 
            icon={Gavel} 
            label="Formalizadas" 
            value={causasFormalizadas} 
            color="green" 
          />
          <StatCard 
            icon={UserX} 
            label="Como Imputado" 
            value={comoImputado} 
            color="amber" 
          />
          <StatCard 
            icon={Eye} 
            label="Sujeto de Interés" 
            value={comoSujetoInteres} 
            color="purple" 
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white shadow-sm border p-1 rounded-xl">
            <TabsTrigger 
              value="info" 
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <User className="h-4 w-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger 
              value="fotos"
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <Camera className="h-4 w-4 mr-2" />
              Fotografías
            </TabsTrigger>
            <TabsTrigger 
              value="causas"
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <Scale className="h-4 w-4 mr-2" />
              Causas ({totalCausas})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Información */}
          <TabsContent value="info" className="space-y-6">
            {/* Datos Personales */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#004388]/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-[#004388]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Datos Personales</CardTitle>
                    <CardDescription>Información de identificación</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoField 
                    icon={User}
                    label="Nombre Completo" 
                    value={imputado.nombreSujeto} 
                  />
                  <InfoField 
                    icon={Fingerprint}
                    label="RUN / Documento" 
                    value={imputado.docId} 
                  />
                  <InfoField 
                    icon={Flag}
                    label="Nacionalidad" 
                    value={imputado.nacionalidad?.nombre} 
                  />
                  <InfoField 
                    icon={BookUser}
                    label="Alias" 
                    value={imputado.alias}
                  />
                  <InfoField 
                    icon={Calendar}
                    label="Fecha de Registro" 
                    value={imputado.createdAt 
                      ? format(new Date(imputado.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })
                      : null
                    } 
                  />
                  <InfoField 
                    icon={Clock}
                    label="Última Actualización" 
                    value={imputado.updatedAt 
                      ? format(new Date(imputado.updatedAt), "d 'de' MMMM 'de' yyyy", { locale: es })
                      : null
                    } 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Características</CardTitle>
                    <CardDescription>Descripción física y señas particulares</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {imputado.caracteristicas ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {imputado.caracteristicas}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No hay características registradas</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Puedes agregar características editando el registro del imputado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Fotografías */}
          <TabsContent value="fotos">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur print:hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#004388]/10 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-[#004388]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Fotografías</CardTitle>
                      <CardDescription>Galería de imágenes del sujeto</CardDescription>
                    </div>
                  </div>
                  {imputado.docId && (
                    <FichabFotoButton 
                      rut={imputado.docId} 
                      variant="outline"
                      size="sm"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ImputadoPhotos imputadoId={id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Causas */}
          <TabsContent value="causas">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#A22138]/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-[#A22138]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Causas Asociadas</CardTitle>
                    <CardDescription>Historial de participación en causas judiciales</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {imputado.causas && imputado.causas.length > 0 ? (
                  <div className="space-y-4">
                    {imputado.causas.map((causa: CausaImputado, index: number) => (
                      <div 
                        key={causa.causaId} 
                        className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all hover:border-[#004388]/30"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#004388]/10 flex items-center justify-center text-[#004388] font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link 
                                  href={`/dashboard/causas/view/${causa.causaId}`}
                                  className="font-semibold text-[#004388] hover:underline"
                                >
                                  {causa.causa.ruc || 'RUC no disponible'}
                                </Link>
                                <span className="text-slate-400">•</span>
                                <span className="text-sm text-slate-600">
                                  {causa.causa.denominacionCausa}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {causa.formalizado && (
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                    <BadgeCheck className="h-3 w-3 mr-1" />
                                    Formalizado
                                  </Badge>
                                )}
                                {causa.esimputado && (
                                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                                    <UserX className="h-3 w-3 mr-1" />
                                    Imputado
                                  </Badge>
                                )}
                                {causa.essujetoInteres && (
                                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Sujeto de Interés
                                  </Badge>
                                )}
                                {causa.causa.delito && (
                                  <Badge variant="outline">
                                    <Gavel className="h-3 w-3 mr-1" />
                                    {causa.causa.delito.nombre}
                                  </Badge>
                                )}
                              </div>
                              
                              {causa.causa.tribunal && (
                                <p className="text-sm text-slate-500 mt-2">
                                  <Scale className="h-3 w-3 inline mr-1" />
                                  {causa.causa.tribunal.nombre}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1 lg:min-w-[180px]">
                            {causa.fechaFormalizacion && (
                              <div className="text-sm text-slate-600">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {format(new Date(causa.fechaFormalizacion), "d MMM yyyy", { locale: es })}
                              </div>
                            )}
                            {causa.plazo && (
                              <div className="text-sm text-slate-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Plazo: {causa.plazo} días
                              </div>
                            )}
                            {causa.cautelar && (
                              <Badge className="bg-green-100 text-green-700 mt-1">
                                <Shield className="h-3 w-3 mr-1" />
                                {causa.cautelar.nombre}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Scale className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No hay causas asociadas</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Este imputado no tiene participación en causas registradas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pie de página para impresión */}
        <div className="hidden print:fixed print:bottom-0 print:left-0 print:block print:w-full print:border-t print:py-4 print:text-center print:text-sm print:text-gray-500">
          <p>
            Documento generado el{' '}
            {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function ImputadoDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#004388]" />
      </div>
    }>
      <ImputadoDetailContent params={params} />
    </Suspense>
  );
}
