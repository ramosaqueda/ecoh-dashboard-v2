import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from '@/components/ui/table';
import MiembroItem from './MiembroItem';

import { Imputado, Miembro } from '@/types/organizacion';

// ✅ Interfaces TypeScript específicas
interface MiembrosFormProps {
  miembros: Miembro[];
  imputados: Imputado[];
  isLoading?: boolean;
  onAddMiembro: () => void;
  onUpdateMiembro: (index: number, field: string, value: any) => void;
  onRemoveMiembro: (index: number) => void;
}

// ✅ Tipo para el estado de combobox
type ComboboxState = Record<number, boolean>;

const MiembrosForm: React.FC<MiembrosFormProps> = ({
  miembros,
  imputados,
  isLoading = false,
  onAddMiembro,
  onUpdateMiembro,
  onRemoveMiembro
}) => {
  const [openCombobox, setOpenCombobox] = useState<ComboboxState>({});

  const handleOpenComboboxChange = (index: number, open: boolean): void => {
    setOpenCombobox((prev) => ({
      ...prev,
      [index]: open
    }));
  };

  const handleUpdateMiembro = (index: number, field: string, value: any): void => {
    onUpdateMiembro(index, field, value);
  };

  const handleRemoveMiembro = (index: number): void => {
    // Limpiar el estado del combobox cuando se remueve un miembro
    setOpenCombobox((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    onRemoveMiembro(index);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Lista de Miembros</h3>
          <Button onClick={onAddMiembro} type="button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Miembro
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imputado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Fecha Salida</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {miembros.length > 0 ? (
                miembros.map((miembro, index) => (
                  <MiembroItem
                    key={`miembro-${index}-${miembro.id || 'new'}`}
                    miembro={miembro}
                    index={index}
                    imputados={imputados}
                    onUpdate={handleUpdateMiembro}
                    onRemove={handleRemoveMiembro}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay miembros agregados. Haga clic en "Agregar Miembro" para comenzar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {miembros.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Total de miembros: {miembros.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiembrosForm;