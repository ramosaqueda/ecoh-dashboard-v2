'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useFichabSession } from '@/components/fichab/FichabSessionConfig';
import { FileText, Loader2, AlertCircle, AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import copy from 'copy-to-clipboard';

interface FichabRucButtonProps {
  ruc: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const FichabRucButton = ({ ruc, className, variant = "ghost", size = "icon" }: FichabRucButtonProps) => {
  // ... (state logic remains same)
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [relatoData, setRelatoData] = useState<any>(null);
  const [delitosData, setDelitosData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fichabSession = useFichabSession();
  const relatoRef = useRef<HTMLDivElement>(null);

  const handleConsultar = async () => {
    // ... (logic remains same)
    if (!fichabSession) {
      toast({
        variant: 'destructive',
        title: 'FICHAB no configurado',
        description: 'Configure su sesión FICHAB en el ícono del header'
      });
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);
    setData(null);
    setRelatoData(null);
    setDelitosData(null);

    try {
      const [responseDatos, responseRelato, responseDelitos] = await Promise.all([
        fetch('/api/fichab/caso/datos-generales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruc, ciSession: fichabSession.ciSession, serverId: fichabSession.serverId })
        }),
        fetch('/api/fichab/caso/relato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruc, ciSession: fichabSession.ciSession, serverId: fichabSession.serverId })
        }),
        fetch('/api/fichab/caso/delitos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruc, ciSession: fichabSession.ciSession, serverId: fichabSession.serverId })
        })
      ]);

      const resultDatos = await responseDatos.json();
      const resultRelato = await responseRelato.json();
      const resultDelitos = await responseDelitos.json();

      if (!responseDatos.ok) {
        throw new Error(resultDatos.message || 'Error al consultar FICHAB Datos Generales');
      }

      setData(resultDatos.data);
      
      if (responseRelato.ok && resultRelato.success) {
        setRelatoData(resultRelato.data);
      }

      if (responseDelitos.ok && resultDelitos.success) {
        setDelitosData(resultDelitos.data);
      }

    } catch (err: any) {
      console.error('Error fetching Ficha B:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Consultando FICHAB...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive mb-4">{error}</p>
            <Button 
                variant="outline" 
                onClick={() => window.open('https://balanceador-qa.minpublico.cl/fichab', '_blank')}
            >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir a FICHAB
            </Button>
        </div>
      );
    }

    if (!data) return null;

    if (data.bloque) {
       const primerParrafo = data.bloque.primerParrafo || '';
       const segundoParrafo = data.bloque.segundoParrafo || '';
       const tablaEscritorio = data.bloque.tablaEscritorio || '';

       return (
         <div className="space-y-4 text-sm">
            {/* Primer Parrafo: Estado y Fecha */}
            <div 
              className="bg-muted/30 p-3 rounded-md border"
              dangerouslySetInnerHTML={{ __html: primerParrafo }} 
            />

            {/* Segundo Parrafo: Asignación */}
            <div 
              className="bg-blue-50/50 p-3 rounded-md border border-blue-100"
              dangerouslySetInnerHTML={{ __html: segundoParrafo }} 
            />

            {/* Tabla Escritorio: Detalles del Caso */}
            {tablaEscritorio && (
              <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                <div 
                  className="w-full overflow-x-auto p-4 
                  [&>table]:!w-full [&>table]:!border-collapse [&>table]:text-sm 
                  [&_td]:!border-b [&_td]:!border-gray-100 [&_td]:p-3 [&_td]:align-top
                  [&_td.textoDerecha]:!w-[140px] [&_td.textoDerecha]:font-semibold [&_td.textoDerecha]:text-muted-foreground [&_td.textoDerecha]:text-right
                  [&_strong]:font-medium [&_strong]:text-gray-900
                  [&_strong.btn-danger]:!bg-red-100 [&_strong.btn-danger]:!text-red-700 [&_strong.btn-danger]:!border-none [&_strong.btn-danger]:px-2 [&_strong.btn-danger]:py-0.5 [&_strong.btn-danger]:rounded-full [&_strong.btn-danger]:text-xs
                  [&_button]:hidden
                  [&_span.btn]:hidden
                  [&_td[style*='width:10px']]:!hidden
                  [&_.btn]:hidden
                  [&_td]:!border-r-0 [&_td]:!border-l-0 [&_td]:!border-t-0
                  [&_table]:!border-none
                  "
                  dangerouslySetInnerHTML={{ __html: tablaEscritorio }} 
                />
              </div>
            )}

            {/* Relato del Hecho */}
            {relatoData && relatoData.bloque && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-md p-4 group/relato relative">
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Relato del Hecho
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50"
                            onClick={() => {
                                const element = document.getElementById(`relato-content-${ruc}`);
                                let textToCopy = "";
                                
                                if (element) {
                                    textToCopy = element.innerText;
                                } else {
                                     // Fallback si no encuentra el elemento
                                    textToCopy = new DOMParser().parseFromString(relatoData.bloque, 'text/html').body.textContent || "";
                                }

                                if (!textToCopy) return;

                                const success = copy(textToCopy);
                                
                                if (success) {
                                    toast({ 
                                        title: "Relato copiado", 
                                        description: "Texto copiado al portapapeles correctamente" 
                                    });
                                } else {
                                    toast({ 
                                        variant: "destructive",
                                        title: "Error al copiar", 
                                        description: "No se pudo copiar el texto automÃ¡ticamente." 
                                    });
                                }
                            }}
                            title="Copiar relato"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copiar</span>
                        </Button>
                     </div>
                     <div 
                        id={`relato-content-${ruc}`}
                        className="text-sm text-gray-800 leading-relaxed font-mono whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: relatoData.bloque }}
                     />
                </div>
            )}

            {/* Delitos */}
            {delitosData && delitosData.listado && delitosData.listado.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b">
                         <h3 className="font-semibold text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Delitos Asociados ({delitosData.total})
                         </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Materia</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fecha Hecho</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Comuna</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Dirección/Sitio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {delitosData.listado.map((delito: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-muted/20">
                                        <td className="px-4 py-2 font-medium">{delito.MATERIA}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{delito.FECHAHECHO}</td>
                                        <td className="px-4 py-2">{delito.COMUNA}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col">
                                                <span>{delito.DIRECCIONDELITO}</span>
                                                <span className="text-xs text-muted-foreground">{delito.SITIOSUCESO}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
         </div>
       );
    }

    return (
      <div className="space-y-4">
        {data.html ? (
             <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: data.html }}
            />
        ) : (
             <div className="rounded-lg border p-4 bg-muted/20">
                <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-[60vh]">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => {
              e.stopPropagation();
              handleConsultar();
          }}
          title="Ver en Ficha B"
      >
          <FileText className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-none w-[80vw] max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Datos Generales Ficha B - RUC {ruc}</DialogTitle>
          </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-4">
                {renderContent()}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
