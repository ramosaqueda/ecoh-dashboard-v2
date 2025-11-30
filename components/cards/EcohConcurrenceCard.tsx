'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { useYearContext } from '@/components/YearSelector';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface ConcurrenceData {
    delito: string;
    total: number;
    concurrencia: number;
    noConcurrencia: number;
}

const EcohConcurrenceCard: React.FC = () => {
    const { isLoaded, isSignedIn } = useAuth();
    const { selectedYear } = useYearContext();
    const [data, setData] = useState<ConcurrenceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const yearParam = selectedYear !== 'todos' ? `?year=${selectedYear}` : '';
                const response = await fetch(`/api/analytics/ecoh-concurrence${yearParam}`);

                if (!response.ok) {
                    throw new Error('Error al cargar datos');
                }

                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Error fetching concurrence data:', err);
                setError('No se pudieron cargar los datos de concurrencia.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedYear, isLoaded, isSignedIn]);

    if (!isLoaded || isLoading) {
        return (
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                        Concurrencia a Sitio del Suceso (ECOH)
                    </CardTitle>
                    <CardDescription>Cargando datos...</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Concurrencia a Sitio del Suceso (ECOH)
                </CardTitle>
                <CardDescription>
                    Relación de causas ECOH (Elqui y Limarí) con concurrencia a sitio del suceso por tipo de delito.
                    {selectedYear !== 'todos' && ` Año: ${selectedYear}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No hay datos registrados para este período.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="delito"
                                    type="category"
                                    width={150}
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="concurrencia"
                                    name="Concurrencia"
                                    stackId="a"
                                    fill="#22c55e"
                                    radius={[0, 4, 4, 0]}
                                />
                                <Bar
                                    dataKey="noConcurrencia"
                                    name="No Concurrencia"
                                    stackId="a"
                                    fill="#94a3b8"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EcohConcurrenceCard;
