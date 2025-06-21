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
import ImputadoCombobox from './components/ImputadoCombobox';

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

// Interfaz corregida para el formulario
interface MemberFormData {
  imputadoId: number | null; // ← Cambiado a number | null
  rol: string;
  fechaIngreso: string;
  fechaSalida: string | null; // ← Cambiado para permitir string de fecha
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
    imputadoId: null, // ← Inicia como null en lugar de string vacío
    rol: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaSalida: null,
    activo: true
  });
  const [imputados, setImputados] = useState<Imputado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
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
    setError(null);
    
    // Validaciones mejoradas
    if (!formData.imputadoId || formData.imputadoId <= 0) {
      setError('Debe seleccionar un imputado válido');
      return;
    }

    if (!formData.fechaIngreso) {
      setError('La fecha de ingreso es requerida');
      return;
    }

    // Preparar datos para envío con validación adicional
    const dataToSend = {
      imputadoId: formData.imputadoId, // Ya es number
      rol: formData.rol.trim() || undefined, // Enviar undefined si está vacío
      fechaIngreso: formData.fechaIngreso,
      fechaSalida: formData.fechaSalida || null, // Asegurar null si está vacío
      activo: formData.activo
    };

    console.log('=== DATOS QUE SE ENVÍAN DESDE EL FRONTEND ===');
    console.log('Datos originales del formulario:', formData);
    console.log('Datos preparados para envío:', dataToSend);
    console.log('JSON que se enviará:', JSON.stringify(dataToSend));
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/organizacion/${organization.id}/miembros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        
        // Mostrar error más específico
        if (errorData.details) {
          const errorMessages = errorData.details.map((detail: any) => 
            `${detail.field}: ${detail.message}`
          ).join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Error al añadir miembro');
      }
      
      const result = await response.json();
      console.log('Miembro creado exitosamente:', result);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error completo:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  // Función auxiliar para manejar el cambio de imputado
  const handleImputadoChange = (value: string) => {
    const numericValue = value ? parseInt(value, 10) : null;
    console.log('Imputado seleccionado - String:', value, 'Number:', numericValue);
    setFormData({...formData, imputadoId: numericValue});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Imputado <span className="text-red-500">*</span>
        </label>
        <ImputadoCombobox
          value={formData.imputadoId?.toString() || ''} // Convertir back a string para el combobox
          onChange={handleImputadoChange}
          imputados={imputados}
          isDisabled={loading || submitting}
          error={error ? "Error al cargar imputados" : undefined}
        />
        {formData.imputadoId && (
          <p className="text-xs text-gray-500 mt-1">
            ID seleccionado: {formData.imputadoId}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <Input
          value={formData.rol}
          onChange={(e) => setFormData({...formData, rol: e.target.value})}
          placeholder="Ej: Líder, Colaborador, etc."
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de Ingreso <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={formData.fechaIngreso}
          onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
          required
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha de Salida (opcional)</label>
        <Input
          type="date"
          value={formData.fechaSalida || ''}
          onChange={(e) => setFormData({
            ...formData, 
            fechaSalida: e.target.value || null
          })}
          disabled={submitting}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activo"
          checked={formData.activo}
          onChange={(e) => setFormData({...formData, activo: e.target.checked})}
          disabled={submitting}
        />
        <label htmlFor="activo" className="text-sm font-medium">
          Miembro activo
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || submitting || !formData.imputadoId}>
          {submitting ? 'Añadiendo...' : 'Añadir Miembro'}
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
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number): Promise<void> => {
    try {
      // Usar el endpoint DELETE corregido con query parameter
      const response = await fetch(
        `/api/organizacion/${organization.id}/miembros?miembroId=${memberId}`, 
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el miembro');
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
          <DialogTitle>Añadir Nuevo Miembro a {organization?.nombre}</DialogTitle>
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
            Miembros de {organization?.nombre} ({members.length})
          </h3>
          <Button onClick={() => setShowAddMember(true)}>
            Añadir Miembro
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay miembros registrados en esta organización
          </div>
        ) : (
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
                    <TableCell>{member.rol || '-'}</TableCell>
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
        )}
      </div>

      <AlertDialog 
        open={memberToDelete !== null} 
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al miembro "{memberToDelete?.imputado?.nombreSujeto}" 
              de la organización y no se puede deshacer.
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