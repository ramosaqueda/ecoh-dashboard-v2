'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImputadoCombobox from './components/ImputadoCombobox'; // Ajusta la ruta según sea necesario

// Importar tipos existentes del proyecto
import type { 
  Miembro, 
  Imputado 
} from '@/types/organizacion';

// Definir interface Organization localmente (no existe en organizacion.ts)
interface Organization {
  id: number;
  nombre: string;
}

interface MemberFormData {
  imputadoId: string | '';
  rol: string;
  fechaIngreso: string;
  fechaSalida: null;
  activo: boolean;
}

interface AddMemberFormProps {
  organization: Organization;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MembersFormProps {
  organization: Organization;
  onClose: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ organization, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<MemberFormData>({
    imputadoId: '',
    rol: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaSalida: null,
    activo: true
  });
  const [imputados, setImputados] = useState<Imputado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImputados();
  }, []);

  const fetchImputados = async (): Promise<void> => {
    try {
      const response = await fetch('/api/imputado');
      if (!response.ok) throw new Error('Error al cargar imputados');
      const data: Imputado[] = await response.json();
      setImputados(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un imputado
    if (!formData.imputadoId || formData.imputadoId === '') {
      setError('Debe seleccionar un imputado');
      return;
    }
    
    try {
      const response = await fetch(`/api/organizacion/${organization.id}/miembros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al añadir miembro');
      
      onSuccess?.();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Imputado</label>
        <ImputadoCombobox
          value={formData.imputadoId}
          onChange={(value: string) => setFormData({...formData, imputadoId: value})}
          imputados={imputados}
          isDisabled={loading}
          error={error ? "Error al cargar imputados" : undefined}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <Input
          value={formData.rol}
          onChange={(e) => setFormData({...formData, rol: e.target.value})}
          placeholder="Ej: Líder, Colaborador, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
        <Input
          type="date"
          value={formData.fechaIngreso}
          onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          Añadir Miembro
        </Button>
      </div>
    </form>
  );
};

const MembersForm: React.FC<MembersFormProps> = ({ organization, onClose }) => {
  const [members, setMembers] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<Miembro | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const fetchMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizacion/${organization.id}/miembros`);
      if (!response.ok) throw new Error('Error al cargar los miembros');
      const data: Miembro[] = await response.json();
      setMembers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number): Promise<void> => {
    try {
      const response = await fetch(
        `/api/organizacion/${organization.id}/miembros/${memberId}`, 
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el miembro');
      }

      await fetchMembers();
      setMemberToDelete(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando miembros...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (showAddMember) {
    return (
      <div className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Miembro</DialogTitle>
        </DialogHeader>
        <AddMemberForm 
          organization={organization}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => {
            setShowAddMember(false);
            fetchMembers();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Miembros de {organization?.nombre}
          </h3>
          <Button onClick={() => setShowAddMember(true)}>
            Añadir Miembro
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Fecha Salida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.imputado?.nombreSujeto}</TableCell>
                  <TableCell>{member.rol}</TableCell>
                  <TableCell>{new Date(member.fechaIngreso).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {member.fechaSalida 
                      ? new Date(member.fechaSalida).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setMemberToDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog 
        open={memberToDelete !== null} 
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al miembro de la organización y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToDelete?.id && handleDeleteMember(memberToDelete.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MembersForm;