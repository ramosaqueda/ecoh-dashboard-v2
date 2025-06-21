'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { Persona } from '@/components/Genograma/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

interface CsvImportButtonProps {
  onImportPersonas: (personas: Persona[]) => void;
}

export function CsvImportButton({ onImportPersonas }: CsvImportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview([]);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Por favor, seleccione un archivo CSV válido');
      return;
    }
    
    setFile(selectedFile);
    
    // Previsualizar el CSV
    Papa.parse(selectedFile, {
      header: true,
      preview: 5, // Mostrar solo las primeras 5 filas
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error al analizar el CSV: ' + results.errors[0].message);
          return;
        }
        
        setPreview(results.data);
      },
      error: (err) => {
        setError('Error al leer el archivo: ' + err.message);
      }
    });
  };

  const processAndImportCsv = () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error al procesar el CSV: ' + results.errors[0].message);
          setIsLoading(false);
          return;
        }
        
        try {
          // Procesar los datos del CSV y convertirlos al formato de Persona
          const personas: Persona[] = results.data
            .filter((row: any) => row.ID && row['nombre y apellidos']) // Solo filas con ID y nombre
            .map((row: any, index: number) => {
              // Dividir nombre y apellidos
              const nombreCompleto = row['nombre y apellidos'] || '';
              const nombreParts = nombreCompleto.split(' ');
              const nombre = nombreParts[0] || '';
              const apellido = nombreParts.length > 1 ? nombreParts.slice(1).join(' ') : '';
              
              // Determinar si está fallecido
              let esFallecido = false;
              if (typeof row['persona fallecida'] === 'string') {
                const fallecidoStr = row['persona fallecida'].toLowerCase().trim();
                esFallecido = fallecidoStr === 'true' || fallecidoStr === 'si' || fallecidoStr === 'sí' || fallecidoStr === '1';
              } else if (typeof row['persona fallecida'] === 'boolean') {
                esFallecido = row['persona fallecida'];
              }
              
              // Limpiar y validar ID
              const id = row.ID?.toString().trim() || `P${index + 1}`;
              
              return {
                id,
                nombre,
                segundoNombre: '',
                apellido,
                segundoApellido: '',
                nombreCompleto,
                genero: 'masculino', // Valor por defecto
                fechaNacimiento: row['fecha de nacimiento'] || '',
                esFallecido,
                fechaFallecimiento: '',
                rolEspecial: 'ninguno',
                ramaFamiliar: 'ninguna',
              };
            });
          
          if (personas.length === 0) {
            setError('No se encontraron datos válidos en el CSV');
            setIsLoading(false);
            return;
          }
          
          // Enviar las personas importadas al componente padre
          onImportPersonas(personas);
          toast.success(`Se importaron ${personas.length} personas correctamente`);
          setDialogOpen(false);
        } catch (err: any) {
          setError('Error al procesar los datos: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      },
      error: (err) => {
        setError('Error al leer el archivo: ' + err.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Personas desde CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="csvFile" className="text-sm font-medium">
              Seleccione un archivo CSV con los siguientes encabezados:
            </label>
            <div className="text-xs bg-gray-100 p-2 rounded">
              ID, nombre y apellidos, fecha de nacimiento, persona fallecida
            </div>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="border rounded p-2 text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Vista previa:</h3>
              <div className="border rounded overflow-auto max-h-40">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((header) => (
                        <th 
                          key={header}
                          className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((cell: any, i) => (
                          <td key={i} className="px-2 py-1 whitespace-nowrap truncate max-w-[150px]">
                            {cell?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={processAndImportCsv} 
            disabled={!file || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? 'Procesando...' : 'Importar Personas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}