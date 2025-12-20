'use client';
import { Relacion, Persona } from '@/components/Genograma/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowRight } from 'lucide-react';

interface RelationListProps {
  relaciones: Relacion[];
  personas: Persona[];
  onEdit: (relacion: Relacion) => void;
  onDelete: (relacion: Relacion) => void;
}

export const RelationList: React.FC<RelationListProps> = ({ relaciones, personas, onEdit, onDelete }) => {
  const getPersonaName = (id: string) => {
    const p = personas.find(per => per.id === id);
    return p ? (p.nombreCompleto || p.nombre) : id;
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {relaciones.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No hay relaciones registradas.</div>}
      {relaciones.map((r, idx) => (
        <div key={`${r.idOrigen}-${r.idDestino}-${idx}`} className="flex items-center justify-between p-3 border rounded-md bg-white hover:bg-slate-50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-medium">
                <span>{getPersonaName(r.idOrigen)}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span>{getPersonaName(r.idDestino)}</span>
            </div>
            <div className="text-xs text-slate-500">
                {r.tipo} {r.descripcion && `(${r.descripcion})`}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => onEdit(r)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(r)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
