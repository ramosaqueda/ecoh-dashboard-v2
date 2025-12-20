'use client';
import { Persona } from '@/components/Genograma/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';

interface PersonListProps {
  personas: Persona[];
  onEdit: (persona: Persona) => void;
  onDelete: (id: string) => void;
}

export const PersonList: React.FC<PersonListProps> = ({ personas, onEdit, onDelete }) => {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {personas.length === 0 && <div className="text-sm text-slate-500 text-center py-4">No hay personas registradas.</div>}
      {personas.map((p) => (
        <div key={p.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.genero === 'masculino' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                {p.fotoUrl ? (
                    <img src={p.fotoUrl} alt={p.nombre} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <User className="w-4 h-4" />
                )}
            </div>
            <div>
              <div className="font-medium text-sm">{p.nombreCompleto}</div>
              <div className="text-xs text-slate-500">ID: {p.id} | {p.esFallecido ? '✝' : ''} {p.rolEspecial !== 'ninguno' && `| ${p.rolEspecial}`}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => onEdit(p)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
