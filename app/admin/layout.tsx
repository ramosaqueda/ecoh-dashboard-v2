import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - ECOH',
    description: 'Panel de administración de tablas paramétricas'
};

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold">Administración</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestión de tablas paramétricas del sistema
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    );
}
