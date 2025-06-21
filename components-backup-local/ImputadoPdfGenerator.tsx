import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ImputadoDetail, type CausaImputado } from '@/types/imputado';

// Configuración de fuentes para pdfMake con tipado correcto
if (typeof window !== 'undefined' && pdfMake.vfs === undefined) {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
}

interface ImputadoPdfProps {
    imputadoData: ImputadoDetail;
}

interface PhotoData {
    id: string;
    url: string;
    createdAt: string;
}

const ImputadoPdfGenerator: React.FC<ImputadoPdfProps> = ({ imputadoData }) => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchImputadoPhotos = async (imputadoId: string): Promise<PhotoData[]> => {
        try {
            const response = await fetch(`/api/imputado/${imputadoId}/photos`);
            if (!response.ok) throw new Error('Error fetching photos');
            const photos = await response.json();
            return photos;
        } catch (error) {
            console.error('Error fetching photos:', error);
            return [];
        }
    };

    const convertImageToBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    const formatDate = (date: string | Date | null): string => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es });
    };

    const getCurrentDateTime = (): string => {
        return format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    };

    const getEstadisticas = (imputado: ImputadoDetail) => {
        return [
            ['Total de causas:', imputado.causas?.length || 0],
            ['Causas formalizadas:', imputado.causas?.filter(c => c.formalizado).length || 0],
            ['Como imputado:', imputado.causas?.filter(c => c.esimputado).length || 0],
            ['Como sujeto de interés:', imputado.causas?.filter(c => c.essujetoInteres).length || 0]
        ];
    };

    const getCausasContent = (causas: CausaImputado[]) => {
        return causas.map(causa => {
            const badges: string[] = [];
            
            if (causa.formalizado) badges.push('Formalizado');
            if (causa.esimputado) badges.push('Imputado');
            if (causa.essujetoInteres) badges.push('Sujeto de interés');
            if (causa.causa.delito?.nombre) badges.push(causa.causa.delito.nombre);

            return [
                {
                    stack: [
                        {
                            text: [
                                { text: causa.causa.ruc || 'RUC no disponible', bold: true },
                                ' • ',
                                causa.causa.denominacionCausa
                            ]
                        },
                        {
                            text: badges.join(' | '),
                            fontSize: 8,
                            color: '#4B5563',
                            margin: [0, 5, 0, 5]
                        },
                        causa.causa.tribunal?.nombre ? {
                            text: causa.causa.tribunal.nombre,
                            fontSize: 8,
                            color: '#6B7280'
                        } : {},
                        causa.fechaFormalizacion ? {
                            text: `Formalizado el ${formatDate(causa.fechaFormalizacion)}`,
                            fontSize: 8,
                            color: '#6B7280',
                            margin: [0, 5, 0, 0]
                        } : {},
                        causa.plazo ? {
                            text: `Plazo: ${causa.plazo} días`,
                            fontSize: 8,
                            color: '#6B7280'
                        } : {},
                        causa.cautelar ? {
                            text: `Medida cautelar: ${causa.cautelar.nombre}`,
                            fontSize: 8,
                            color: '#166534',
                            margin: [0, 5, 0, 0]
                        } : {}
                    ],
                    margin: [0, 0, 0, 15]
                }
            ];
        });
    };

    const generatePdf = async () => {
        setIsLoading(true);
        try {
            // Obtener las fotos
            const photos = await fetchImputadoPhotos(imputadoData.id.toString());
            let photosContent: any[] = [];
            
            if (photos && photos.length > 0) {
                const photoRows: any[] = [];
                for (let i = 0; i < photos.length; i += 2) {
                    const row: any = {
                        columns: []
                    };
                    
                    // Primera foto de la fila
                    try {
                        const base64Data = await convertImageToBase64(photos[i].url);
                        row.columns.push({
                            stack: [
                                {
                                    image: base64Data,
                                    width: 250,
                                    alignment: 'center'
                                },
                                {
                                    text: format(new Date(photos[i].createdAt), "d 'de' MMMM 'de' yyyy", { locale: es }),
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        });
                    } catch (error) {
                        console.error('Error converting image:', error);
                    }

                    // Segunda foto de la fila (si existe)
                    if (i + 1 < photos.length) {
                        try {
                            const base64Data = await convertImageToBase64(photos[i + 1].url);
                            row.columns.push({
                                stack: [
                                    {
                                        image: base64Data,
                                        width: 250,
                                        alignment: 'center'
                                    },
                                    {
                                        text: format(new Date(photos[i + 1].createdAt), "d 'de' MMMM 'de' yyyy", { locale: es }),
                                        fontSize: 8,
                                        alignment: 'center',
                                        margin: [0, 5, 0, 0]
                                    }
                                ]
                            });
                        } catch (error) {
                            console.error('Error converting image:', error);
                        }
                    } else {
                        // Si no hay segunda foto, agregar un espacio vacío
                        row.columns.push({});
                    }
                    
                    photoRows.push(row);
                }
                
                photosContent = [
                    {
                        text: 'Registro Fotográfico',
                        style: 'subheader',
                        margin: [0, 20, 0, 10]
                    },
                    ...photoRows
                ];
            }

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
                footer: function(currentPage: number, pageCount: number) {
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
                        text: 'Informe Detallado de Sujeto',
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

                    // Datos Personales
                    {
                        text: 'Datos Personales',
                        style: 'subheader'
                    },
                    {
                        table: {
                            widths: ['30%', '70%'],
                            body: [
                                ['Nombre:', { text: imputadoData.nombreSujeto, bold: true }],
                                ['RUN:', imputadoData.docId || '-'],
                                ['Nacionalidad:', imputadoData.nacionalidad?.nombre || '-'],
                                ['Fecha de registro:', formatDate(imputadoData.createdAt || null)]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },

                    // Estadísticas
                    {
                        text: 'Estadísticas',
                        style: 'subheader',
                        margin: [0, 20, 0, 10]
                    },
                    {
                        table: {
                            widths: ['50%', '50%'],
                            body: getEstadisticas(imputadoData)
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    },

                    // Causas Asociadas
                    {
                        text: 'Causas Asociadas',
                        style: 'subheader',
                        margin: [0, 20, 0, 10]
                    },
                    ...(imputadoData.causas && imputadoData.causas.length > 0
                        ? getCausasContent(imputadoData.causas)
                        : [{
                            text: 'No hay causas asociadas',
                            color: '#6B7280',
                            alignment: 'center',
                            margin: [0, 20]
                        }]),

                    // Sección de fotos
                    ...photosContent
                ],
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
                    footer: {
                        fontSize: 8,
                        color: '#6b7280'
                    }
                },
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 10
                }
            };

            pdfMake.createPdf(documentDefinition).download(`Informe_Sujeto_${imputadoData.docId}.pdf`);
            toast.success('PDF generado exitosamente');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="default" 
            onClick={generatePdf}
            disabled={isLoading}
            className="gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {isLoading ? 'Generando...' : 'Generar Informe PDF'}
        </Button>
    );
};

export default ImputadoPdfGenerator;