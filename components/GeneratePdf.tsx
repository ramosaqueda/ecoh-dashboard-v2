import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Configuración correcta de pdfMake con type assertion
try {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any);
} catch (error) {
    console.error('No se pudo asignar las fuentes vfs a pdfMake:', error);
}

// Interfaces de tipos
interface Usuario {
    nombre?: string;
    email: string;
}

interface TipoActividad {
    nombre: string;
}

interface Actividad {
    id: number;
    fechaInicio: string;
    fechaTermino: string;
    observacion: string;
    estado: string;
    tipoActividad: TipoActividad;
    usuario: Usuario;
}

interface Tribunal {
    nombre: string;
}

interface Delito {
    nombre: string;
}

interface Cautelar {
    id: number;
    nombre: string;
}

interface Causa {
    ruc: string;
    denominacionCausa: string;
    rit: string;
    tribunal: Tribunal;
    delito: Delito;
}

interface CausaImputado {
    esImputado: boolean;
    essujetoInteres: boolean;
    formalizado: boolean;
    fechaFormalizacion: string | null;
    cautelar?: Cautelar;
    causa: Causa;
}

interface DatosCausa {
    id: string;
    RUC: string;
    denominacion: string;
    fiscal: string | null;
    RIT: string;
    delito: string | null;
    folio_bw: string | null;
    fecha_toma_conocimiento: string | null;
    fecha_del_hecho: string | null;
    estado_ecoh: boolean;
    nombre_imputado: string[] | null;
    rut_imputado: string[] | null;
}

interface PdfProps {
    pdfData: DatosCausa;
}

const GeneratePdf: React.FC<PdfProps> = ({ pdfData }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const formatDate = (date: string | null): string => {
        if (!date) return '-';
        return date;
    };

    const getCurrentDateTime = (): string => {
        return new Date().toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoImputado = (imputado: CausaImputado): string => {
        const estados: string[] = [];
        if (imputado.esImputado) estados.push('Imputado');
        if (imputado.essujetoInteres) estados.push('Sujeto de Interés');
        if (imputado.formalizado) estados.push('Formalizado');
        return estados.join(', ') || 'Sin estado específico';
    };

    const fetchImputadosData = async (): Promise<CausaImputado[]> => {
        try {
            console.log('Fetching imputados for causa ID:', pdfData.id);
            const response = await fetch(`/api/causas-imputados/${pdfData.id}`);
            if (!response.ok) throw new Error('Error fetching imputados');
            const data: CausaImputado[] = await response.json();
            console.log('Imputados data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching imputados:', error);
            throw error;
        }
    };

    const fetchActividadesData = async (): Promise<Actividad[]> => {
        try {
            console.log('Fetching actividades for causa ID:', pdfData.id);
            const response = await fetch(`/api/actividades/causa/${pdfData.id}`);
            if (!response.ok) throw new Error('Error fetching actividades');
            const data: Actividad[] = await response.json();
            console.log('Actividades data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching actividades:', error);
            throw error;
        }
    };

    const generatePdf = async (): Promise<void> => {
        if (!pdfData.id) {
            toast.error('ID de causa no válido');
            return;
        }
        
        setIsLoading(true);
        try {
            console.log('Generating PDF for causa:', pdfData);
            
            // Fetch additional data
            const [imputadosData, actividadesData] = await Promise.all([
                fetchImputadosData(),
                fetchActividadesData()
            ]);

            const documentDefinition: any = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                header: {
                    text: 'SACFI-ECOH',
                    alignment: 'right',
                    margin: [0, 20, 40, 0],
                    color: '#6b7280',
                    fontSize: 8
                },
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        color: '#2563eb',
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 14,
                        bold: true,
                        color: '#1e40af',
                        margin: [0, 10, 0, 5]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: '#ffffff',
                        fillColor: '#2563eb'
                    },
                    footer: {
                        fontSize: 8,
                        color: '#6b7280'
                    }
                },
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 10
                },
                footer: function(currentPage: number, pageCount: number): any {
                    return {
                        columns: [
                            {
                                text: `Generado el: ${getCurrentDateTime()}`,
                                alignment: 'left',
                                margin: [40, 0, 0, 0],
                                style: 'footer'
                            },
                            {
                                text: `Página ${currentPage.toString()} de ${pageCount}`,
                                alignment: 'right',
                                margin: [0, 0, 40, 0],
                                style: 'footer'
                            }
                        ]
                    };
                },
                content: [
                    {
                        text: 'Informe Detallado de Causa',
                        style: 'header',
                        alignment: 'center',
                        margin: [0, 0, 0, 20]
                    },

                    // Texto de confidencialidad
                    {
                        text: 'INFORMACIÓN CONFIDENCIAL Y RESERVADA\nEste documento contiene información sensible y debe ser tratado con estricta confidencialidad.',
                        style: {
                            fontSize: 8,
                            color: '#ef4444',
                            alignment: 'center',
                            italics: true
                        },
                        margin: [0, 0, 0, 20]
                    },

                    // Información General
                    {
                        text: 'Información General',
                        style: 'subheader'
                    },
                    {
                        table: {
                            widths: ['30%', '70%'],
                            body: [
                                ['RUC:', { text: pdfData.RUC, bold: true }],
                                ['RIT:', pdfData.RIT],
                                ['Denominación:', pdfData.denominacion],
                                ['Fiscal:', pdfData.fiscal || '-'],
                                ['Delito:', pdfData.delito || '-'],
                                ['Folio BW:', pdfData.folio_bw || '-'],
                                ['Fecha del hecho:', formatDate(pdfData.fecha_del_hecho)],
                                ['Fecha toma de conocimiento:', formatDate(pdfData.fecha_toma_conocimiento)],
                                ['Causa ECOH:', pdfData.estado_ecoh ? 'Sí' : 'No']
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },

                    // Información detallada de Imputados
                    {
                        text: 'Información Detallada de Imputados',
                        style: 'subheader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', '*', '*'],
                            body: [
                                [
                                    { text: 'Nombre/RUT', style: 'tableHeader' },
                                    { text: 'Estado', style: 'tableHeader' },
                                    { text: 'Fecha Formalización', style: 'tableHeader' },
                                    { text: 'Medida Cautelar', style: 'tableHeader' }
                                ],
                                ...imputadosData.map((imputado, index) => [
                                    `${pdfData.nombre_imputado?.[index] || '-'}\n${pdfData.rut_imputado?.[index] || '-'}`,
                                    getEstadoImputado(imputado),
                                    formatDate(imputado.fechaFormalizacion),
                                    imputado.cautelar?.nombre || 'Sin medida cautelar'
                                ])
                            ]
                        },
                        layout: {
                            fillColor: function(rowIndex: number): string | null {
                                return (rowIndex % 2 === 0 && rowIndex !== 0) ? '#f3f4f6' : null;
                            }
                        },
                        margin: [0, 0, 0, 20]
                    },

                    // Historial de Actividades
                    {
                        text: 'Historial de Actividades',
                        style: 'subheader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', '*', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Fecha Inicio', style: 'tableHeader' },
                                    { text: 'Fecha Término', style: 'tableHeader' },
                                    { text: 'Tipo y Observación', style: 'tableHeader' },
                                    { text: 'Estado', style: 'tableHeader' },
                                    { text: 'Responsable', style: 'tableHeader' }
                                ],
                                ...actividadesData.map(actividad => [
                                    formatDate(actividad.fechaInicio),
                                    formatDate(actividad.fechaTermino),
                                    {
                                        text: [
                                            { text: `${actividad.tipoActividad.nombre}\n`, bold: true },
                                            { text: actividad.observacion || '-' }
                                        ]
                                    },
                                    actividad.estado,
                                    actividad.usuario.nombre || actividad.usuario.email
                                ])
                            ]
                        },
                        layout: {
                            fillColor: function(rowIndex: number): string | null {
                                return (rowIndex % 2 === 0 && rowIndex !== 0) ? '#f3f4f6' : null;
                            }
                        }
                    }
                ]
            };

            (pdfMake as any).createPdf(documentDefinition).download(`Informe_Causa_${pdfData.RUC}.pdf`);
            toast.success('PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al generar el PDF';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="hidden items-center space-x-2 md:flex">
            <Button 
                variant="outline" 
                size="default" 
                onClick={generatePdf}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Generando...' : 'Generar Informe PDF'}
            </Button>
        </div>
    );
};

export default GeneratePdf;