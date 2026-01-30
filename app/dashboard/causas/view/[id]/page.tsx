// app/dashboard/causas/view/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft, 
  Clock, 
  Scale, 
  User, 
  Users, 
  FileText,
  Calendar,
  MapPin,
  Building2,
  Shield,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { FichabRucButton } from '@/components/fichab/FichabRucButton';

interface MedidaCautelar {
  id: string;
  tipo: string;
  descripcion: string;
  fechaInicio: string;
  fechaTermino: string | null;
}

interface Imputado {
  id: string;
  nombre: string;
  rut: string;
  nacionalidadId: string;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
  foto: string;
  nacionalidad: {
    id: string;
    nombre: string;
  };
  causas?: CausaImputado[];
}

interface CausaImputado {
  id: string;
  causaId: string;
  imputadoId: string;
  esImputado: boolean;
  esSujetoInteres: boolean;
  formalizado: boolean;
  fechaFormalizacion: string;
  cautelarId: string;
  causa: {
    ruc: string
  };
  plazo: string;
  imputado: {
    nombreSujeto: string;
    fotoPrincipal: string;
    docId: string;
  };
  cautelar: {
    nombre: string;
  };
  datosImputado: Imputado;
}

interface Causa {
  id: string;
  denominacionCausa: string;
  ruc: string;
  rit: string;
  fiscal: {
    id: string;
    nombre: string;
  } | null;
  delito: {
    id: string;
    nombre: string;
  } | null;
  fechaDelHecho: string | null;
  fechaHoraTomaConocimiento: string | null;
  causaEcoh: boolean;
  foliobw: string | null;
  observacion: string | null;
  // Campos de Unidad Policial
  unidadPolicialId: number | null;
  unidadPolicial: {
    id: number;
    nombre: string;
    institucion: string | null;
  } | null;
  oficialACargo: string | null;
  // Campo de Origen/Radicación de Causa
  origenCausaId: number | null;
  origenCausa: {
    id: number;
    nombre: string;
    color: string | null;
  } | null;
  causasImputados: Array<{
    id: string;
    imputado: Imputado;
  }>;
  victimas: Array<{
    id: string;
    nombre: string;
    rut: string;
  }>;
}

// Componente para mostrar un campo de información
const InfoField = ({ 
  icon: Icon, 
  label, 
  value, 
  badge = false,
  badgeVariant = 'default',
  badgeColor
}: { 
  icon?: any; 
  label: string; 
  value: string | null | undefined;
  badge?: boolean;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeColor?: string | null;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
    {Icon && (
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#004388]/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-[#004388]" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      {badge ? (
        <Badge 
          variant={badgeVariant}
          className="mt-1"
          style={badgeColor ? { backgroundColor: badgeColor, color: '#fff' } : undefined}
        >
          {value || '-'}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-slate-900 mt-0.5 truncate">{value || '-'}</p>
      )}
    </div>
  </div>
);

export default function CausaViewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [causa, setCausa] = useState<Causa | null>(null);
  const [imputados, setImputados] = useState<CausaImputado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      setIsParamsLoaded(true);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchCausa = async () => {
      try {
        const causaResponse = await fetch(`/api/causas/${id}`);
        if (!causaResponse.ok) throw new Error('Error al cargar la causa');
        const causaData = await causaResponse.json();
        setCausa(causaData);

        const imputadosResponse = await fetch(`/api/causas-imputados?causaId=${id}`);
        if (!imputadosResponse.ok) throw new Error('Error al cargar los imputados');
        const imputadosData = await imputadosResponse.json();
        setImputados(imputadosData);
        
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        toast.error('Error al cargar los datos de la causa');
      } finally {
        setLoading(false);
      }
    };

    fetchCausa();
  }, [id]);

  if (!isParamsLoaded || !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#004388]"></div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#004388]" />
      </div>
    );
  }

  if (!causa) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-600">No se encontró la causa</p>
        <Link href="/dashboard/causas">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
    );
  }
 
  const GeneratePdf = dynamic(() => import('@/components/GeneratePdf'), {
    ssr: false,
  });
  
  const datosCausa = {
    id: causa.id,
    RUC: causa.ruc,
    denominacion: causa.denominacionCausa,
    fiscal: causa.fiscal?.nombre ?? null,
    RIT: causa.rit,
    delito: causa.delito?.nombre ?? null,
    folio_bw: causa.foliobw ?? null,
    fecha_toma_conocimiento: causa.fechaHoraTomaConocimiento ? format(new Date(causa.fechaHoraTomaConocimiento), 'dd/MM/yyyy', {
      locale: es
    }) : null,
    fecha_del_hecho: causa.fechaDelHecho ? format(new Date(causa.fechaDelHecho), 'dd/MM/yyyy', {
      locale: es
    }) : null,
    radicacion_causa: causa.origenCausa?.nombre ?? null,
    nombre_imputado: imputados.map(causaImputado => causaImputado.imputado.nombreSujeto) || null,
    rut_imputado: imputados.map(causaImputado => causaImputado.imputado.docId) || null,
    unidad_policial: causa.unidadPolicial?.nombre ?? null,
    institucion_policial: causa.unidadPolicial?.institucion ?? null,
    oficial_a_cargo: causa.oficialACargo ?? null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/causas">
                <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    {causa.denominacionCausa}
                  </h1>
                  {causa.origenCausa && (
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: causa.origenCausa.color || '#004388', 
                        color: '#fff' 
                      }}
                    >
                      {causa.origenCausa.nombre}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-slate-500 font-mono">RUC: {causa.ruc}</p>
                  <FichabRucButton 
                    ruc={causa.ruc}
                    className="h-5 w-5 text-[#004388] hover:text-[#003066]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <GeneratePdf pdfData={datosCausa} />
              <Link href={`/causas/${causa.id}/timeline`}>
                <Button className="bg-[#004388] hover:bg-[#003366] text-white shadow-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Línea de Tiempo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white shadow-sm border p-1 rounded-xl">
            <TabsTrigger 
              value="info" 
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              Información General
            </TabsTrigger>
            <TabsTrigger 
              value="imputados"
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <Users className="h-4 w-4 mr-2" />
              Imputados ({imputados.length})
            </TabsTrigger>
            <TabsTrigger 
              value="victimas"
              className="rounded-lg data-[state=active]:bg-[#004388] data-[state=active]:text-white px-6"
            >
              <User className="h-4 w-4 mr-2" />
              Víctimas ({causa.victimas?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Información General */}
          <TabsContent value="info" className="space-y-6">
            {/* Datos Principales */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#004388]/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-[#004388]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Datos de la Causa</CardTitle>
                    <CardDescription>Información principal del caso</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoField 
                    icon={FileText}
                    label="RIT" 
                    value={causa.rit} 
                  />
                  <InfoField 
                    icon={User}
                    label="Fiscal a Cargo" 
                    value={causa.fiscal?.nombre} 
                  />
                  <InfoField 
                    icon={Scale}
                    label="Delito" 
                    value={causa.delito?.nombre} 
                  />
                  <InfoField 
                    icon={FileText}
                    label="Folio BW" 
                    value={causa.foliobw} 
                  />
                  <InfoField 
                    icon={Calendar}
                    label="Fecha del Hecho" 
                    value={causa.fechaDelHecho 
                      ? format(new Date(causa.fechaDelHecho), 'dd/MM/yyyy', { locale: es })
                      : null
                    } 
                  />
                  <InfoField 
                    icon={Calendar}
                    label="Fecha Toma Conocimiento" 
                    value={causa.fechaHoraTomaConocimiento 
                      ? format(new Date(causa.fechaHoraTomaConocimiento), 'dd/MM/yyyy HH:mm', { locale: es })
                      : null
                    } 
                  />
                  <InfoField 
                    icon={MapPin}
                    label="Radicación Causa" 
                    value={causa.origenCausa?.nombre}
                    badge={true}
                    badgeColor={causa.origenCausa?.color}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Unidad Policial */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#004388]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#004388]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Unidad Policial a Cargo</CardTitle>
                    <CardDescription>Información del equipo investigador</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoField 
                    icon={Building2}
                    label="Unidad Policial" 
                    value={causa.unidadPolicial 
                      ? `${causa.unidadPolicial.nombre}${causa.unidadPolicial.institucion ? ` (${causa.unidadPolicial.institucion})` : ''}`
                      : null
                    } 
                  />
                  <InfoField 
                    icon={UserCheck}
                    label="Oficial a Cargo" 
                    value={causa.oficialACargo} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            {causa.observacion && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Observaciones</CardTitle>
                      <CardDescription>Notas adicionales del caso</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {causa.observacion}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Imputados */}
          <TabsContent value="imputados">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#A22138]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#A22138]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Imputados y Medidas Cautelares</CardTitle>
                    <CardDescription>Listado de imputados en la causa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {imputados.length > 0 ? (
                  <div className="grid gap-4">
                    {imputados.map((causaImputado, index) => (
                      <div
                        key={causaImputado.id}
                        className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#004388]/10 flex items-center justify-center text-[#004388] font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900">
                              {causaImputado.imputado.nombreSujeto}
                            </h4>
                            <p className="text-sm text-slate-500 font-mono">
                              RUT: {causaImputado.imputado.docId || '-'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {causaImputado.formalizado && (
                                <Badge variant="default" className="bg-[#004388]">Formalizado</Badge>
                              )}
                              {causaImputado.cautelar && (
                                <Badge variant="outline">{causaImputado.cautelar.nombre}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No hay imputados registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Víctimas */}
          <TabsContent value="victimas">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Víctimas</CardTitle>
                    <CardDescription>Listado de víctimas en la causa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {causa.victimas?.length > 0 ? (
                  <div className="grid gap-4">
                    {causa.victimas.map((victima, index) => (
                      <div 
                        key={victima.id} 
                        className="p-4 rounded-xl border bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">{victima.nombre}</h4>
                            <p className="text-sm text-slate-500 font-mono">
                              RUT: {victima.rut || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No hay víctimas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
