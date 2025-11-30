import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, FileText, CheckCircle } from 'lucide-react';

const adminSections = [
    {
        title: 'Tipos de Organización',
        description: 'Gestionar tipos de organizaciones delictuales',
        href: '/admin/tipo-organizacion',
        icon: Database,
        color: 'text-blue-500'
    },
    {
        title: 'Tipos de Actividad',
        description: 'Gestionar tipos de actividades y áreas',
        href: '/admin/tipo-actividad',
        icon: Activity,
        color: 'text-green-500'
    },
    {
        title: 'Orígenes de Causa',
        description: 'Gestionar orígenes de las causas',
        href: '/admin/origen-causa',
        icon: FileText,
        color: 'text-orange-500'
    },
    {
        title: 'Estados de Causa',
        description: 'Gestionar estados de las causas',
        href: '/admin/estado-causa',
        icon: CheckCircle,
        color: 'text-purple-500'
    },
    {
        title: 'Diligencias mínimas',
        description: 'Gestionar listado de diligencias mínimas ',
        href: '/admin/asignacion',
        icon: CheckCircle,
        color: 'text-purple-500'
    }
];

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
                <p className="text-muted-foreground">
                    Seleccione una tabla paramétrica para administrar
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {adminSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link key={section.href} href={section.href}>
                            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-5 w-5 ${section.color}`} />
                                        <CardTitle className="text-lg">{section.title}</CardTitle>
                                    </div>
                                    <CardDescription>{section.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
