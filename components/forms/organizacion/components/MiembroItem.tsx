import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import ImputadoCombobox from './ImputadoCombobox';
import { Miembro, Imputado } from '@/types/organizacion';

interface MiembroItemProps {
  miembro: Miembro;
  index: number;
  imputados: Imputado[];
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}

function MiembroItem({
  miembro,
  index,
  imputados,
  onUpdate,
  onRemove
}: MiembroItemProps) {
  return (
    <TableRow>
      <TableCell>
        <ImputadoCombobox
          value={miembro.imputadoId}
          onChange={(value) => onUpdate(index, 'imputadoId', value)}
          imputados={imputados}
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder="Rol"
          value={miembro.rol}
          onChange={(e) => onUpdate(index, 'rol', e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          placeholder="Orden"
          value={miembro.orden}
          onChange={(e) => onUpdate(index, 'orden', parseInt(e.target.value))}
          min="0"
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !miembro.fechaIngreso && 'text-muted-foreground'
              )}
            >
              {miembro.fechaIngreso ? (
                format(new Date(miembro.fechaIngreso), 'PP')
              ) : (
                <span>Seleccione fecha</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(miembro.fechaIngreso)}
              onSelect={(date) => onUpdate(index, 'fechaIngreso', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !miembro.fechaSalida && 'text-muted-foreground'
              )}
            >
              {miembro.fechaSalida ? (
                format(new Date(miembro.fechaSalida), 'PP')
              ) : (
                <span>Sin fecha de salida</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                miembro.fechaSalida ? new Date(miembro.fechaSalida) : undefined
              }
              onSelect={(date) => onUpdate(index, 'fechaSalida', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default MiembroItem;