'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Network } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MembersForm from '@/components/forms/organizacion/MembersForm';

// ✅ Interfaces TypeScript
interface TipoOrganizacion {
  id: number;
  nombre: string;
}

interface Imputado {
  id: number;
  nombreSujeto: string;
  docId?: string;
}

interface Member {
  id: number;
  rol: string;
  fechaIngreso: string;
  fechaSalida?: string | null;
  activo: boolean;
  imputado: Imputado;
}

interface Organization {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaIdentificacion: string;
  tipoOrganizacionId: number;
  activa: boolean;
  tipoOrganizacion?: TipoOrganizacion;
  miembros?: Member[];
}

interface FormData {
  nombre: string;
  descripcion: string;
  fechaIdentificacion: string;
  tipoOrganizacionId: number | string;
  activa: boolean;
}

interface ApiResponse {
  data: Organization[];
  pagination?: {
    pages: number;
    total: number;
    page: number;
    limit: number;
  };
}

interface OrganizationFormProps {
  organization?: Organization | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MembersDialogProps {
  organization: Organization;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

// ✅ Componente de Formulario de Organización Tipado
const OrganizationForm: React.FC<OrganizationFormProps> = ({ 
  organization, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<FormData>(
    organization ? {
      nombre: organization.nombre,
      descripcion: organization.descripcion || '',
      fechaIdentificacion: organization.fechaIdentificacion.split('T')[0],
      tipoOrganizacionId: organization.tipoOrganizacionId,
      activa: organization.activa
    } : {
      nombre: '',
      descripcion: '',
      fechaIdentificacion: new Date().toISOString().split('T')[0],
      tipoOrganizacionId: '',
      activa: true
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoOrganizacion[]>([]);
  const [loadingTipos, setLoadingTipos] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchTiposOrganizacion();
  }, []);

  const fetchTiposOrganizacion = async (): Promise<void> => {
    try {
      setLoadingTipos(true);
      setError(null);
      const response = await fetch('/api/tipo-organizacion');
      if (!response.ok) {
        throw new Error('Error al cargar tipos de organización');
      }
      const data: TipoOrganizacion[] = await response.json();
      setTipos(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.tipoOrganizacionId) {
      setError('Debe seleccionar un tipo de organización');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const url = organization
        ? `/api/organizacion/${organization.id}`
        : '/api/organizacion';

      const submitData = {
        ...formData,
        tipoOrganizacionId: typeof formData.tipoOrganizacionId === 'string' 
          ? parseInt(formData.tipoOrganizacionId) 
          : formData.tipoOrganizacionId
      };

      const response = await fetch(url, {
        method: organization ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al guardar la organización');
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean | number): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="nombre">
          Nombre *
        </label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Nombre de la organización"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="descripcion">
          Descripción
        </label>
        <Input
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange('descripcion', e.target.value)}
          disabled={isSubmitting}
          placeholder="Descripción opcional"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="fechaIdentificacion">
          Fecha de Identificación *
        </label>
        <Input
          id="fechaIdentificacion"
          type="date"
          value={formData.fechaIdentificacion}
          onChange={(e) => handleInputChange('fechaIdentificacion', e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="tipoOrganizacion">
          Tipo de Organización *
        </label>
        <Select
          value={formData.tipoOrganizacionId.toString()}
          onValueChange={(value) => handleInputChange('tipoOrganizacionId', parseInt(value))}
          disabled={loadingTipos || isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTipos ? "Cargando tipos..." : "Seleccione un tipo"} />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                {tipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          id="activa"
          type="checkbox"
          checked={formData.activa}
          onChange={(e) => handleInputChange('activa', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
          disabled={isSubmitting}
        />
        <label htmlFor="activa" className="text-sm font-medium">
          Organización activa
        </label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || loadingTipos || !formData.nombre.trim()}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">⏳</span>
              {organization ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            organization ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  );
};

// ✅ Componente de Diálogo de Miembros Tipado
const MembersDialog: React.FC<MembersDialogProps> = ({ organization, onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const fetchMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/organizacion/${organization.id}/miembros`);
      if (!response.ok) {
        throw new Error('Error al cargar los miembros');
      }
      const data: Member[] = await response.json();
      setMembers(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Cargando miembros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-w-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Miembros de {organization.nombre}
        </h3>
        <Button onClick={() => console.log('Añadir miembro - función por implementar')}>
          Añadir Miembro
        </Button>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay miembros registrados
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
                  <TableCell>{member.imputado.nombreSujeto}</TableCell>
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
                      <Button variant="outline" size="icon">
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
  );
};

// ✅ Componente Principal Tipado
const OrganizationDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showOrgForm, setShowOrgForm] = useState<boolean>(false);
  const [showMembersDialog, setShowMembersDialog] = useState<boolean>(false);

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, searchTerm]);

  const fetchOrganizations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchTerm
      });

      const response = await fetch(`/api/organizacion?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar las organizaciones');
      }

      const data: ApiResponse = await response.json();
      setOrganizations(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleEditOrg = useCallback((org: Organization): void => {
    setSelectedOrg(org);
    setShowOrgForm(true);
  }, []);

  const handleShowMembers = useCallback((org: Organization): void => {
    setSelectedOrg(org);
    setShowMembersDialog(true);
  }, []);

  const handleCloseOrgForm = useCallback((): void => {
    setShowOrgForm(false);
    setSelectedOrg(null);
  }, []);

  const handleCloseMembersDialog = useCallback((): void => {
    setShowMembersDialog(false);
    setSelectedOrg(null);
  }, []);

  const handleOrgFormSuccess = useCallback((): void => {
    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando organizaciones...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button
                onClick={fetchOrganizations}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Organizaciones</CardTitle>
            <Button onClick={() => setShowOrgForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Organización
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organización..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>

          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron organizaciones que coincidan con la búsqueda' : 'No hay organizaciones registradas'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowOrgForm(true)}
                >
                  Crear primera organización
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Identificación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Miembros</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.nombre}</TableCell>
                        <TableCell>{org.tipoOrganizacion?.nombre || 'Sin tipo'}</TableCell>
                        <TableCell>
                          {new Date(org.fechaIdentificacion).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            org.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {org.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </TableCell>
                        <TableCell>{org.miembros?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditOrg(org)}
                              title="Editar organización"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleShowMembers(org)}
                              title="Ver miembros"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                              title="Ver red de relaciones"
                            >
                              <Link href={`/organizaciones/${org.id}/network`}>
                                <Network className="h-4 w-4 text-blue-600" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({organizations.length} organizaciones)
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para formulario de organización */}
      <Dialog open={showOrgForm} onOpenChange={setShowOrgForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedOrg ? 'Editar Organización' : 'Nueva Organización'}
            </DialogTitle>
          </DialogHeader>
          <OrganizationForm
            organization={selectedOrg}
            onClose={handleCloseOrgForm}
            onSuccess={handleOrgFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para miembros */}
      <Dialog
        open={showMembersDialog}
        onOpenChange={(open) => {
          setShowMembersDialog(open);
          if (!open) setSelectedOrg(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          {selectedOrg && (
            <MembersForm
              organization={selectedOrg}
              onClose={handleCloseMembersDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDashboard;