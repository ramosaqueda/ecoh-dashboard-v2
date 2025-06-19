'use client';

import { useState, useEffect } from 'react';
import { GenogramaForm } from '@/components/forms/GenogramaForm/GenogramaForm';
import { GenogramaViewer } from '@/components/Genograma/GenogramaViewer';
import { GenogramaSearch } from '@/components/Genograma/GenogramaSearch';
import { CsvImportButton } from '@/components/Genograma/CsvImportButton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Persona, Relacion } from '@/components/Genograma/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function GenogramaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rucParam = searchParams.get('ruc') || '';
  
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [rucCausa, setRucCausa] = useState<string>(rucParam);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Cargar el genograma si hay un RUC
  useEffect(() => {
    if (rucParam) {
      setRucCausa(rucParam);
      fetchGenograma(rucParam);
    }
  }, [rucParam]);

  const fetchGenograma = async (ruc: string) => {
    if (!ruc) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/genograma?ruc=${ruc}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No hay genograma para este RUC, es normal
          toast.info(`No se encontró un genograma existente para el RUC: ${ruc}`);
          return;
        }
        throw new Error('Error al cargar el genograma');
      }
      
      const data = await response.json();
      if (data.personas && data.relaciones) {
        setPersonas(data.personas);
        setRelaciones(data.relaciones);
        toast.success('Genograma cargado correctamente');
        
        // Generar el código Mermaid
        handleGenerateGenograma(data.personas, data.relaciones);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el genograma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonas([]);
    setRelaciones([]);
    setMermaidCode('');
    setRucCausa('');
    router.push('/dashboard/genograma');
    toast.info('Genograma reiniciado');
  };
  
  const handleAddPersona = (persona: Persona) => {
    // Verificar si ya existe una persona con el mismo ID
    if (personas.some(p => p.id === persona.id)) {
      toast.error(`Ya existe una persona con el ID: ${persona.id}`);
      return;
    }
    
    // Crear el nombreCompleto a partir de los datos proporcionados
    const nombreCompleto = [
      persona.nombre,
      persona.segundoNombre,
      persona.apellido,
      persona.segundoApellido
    ].filter(Boolean).join(' ');
    
    const newPersona = {
      ...persona,
      nombreCompleto
    };
    
    setPersonas(prev => [...prev, newPersona]);
    toast.success(`Persona ${persona.nombre} agregada correctamente`);
  };

  const handleImportPersonas = (personasImportadas: Persona[]) => {
    // Filtrar personas con IDs que ya existen
    const personasNuevas = personasImportadas.filter(persona => 
      !personas.some(p => p.id === persona.id)
    );
    
    if (personasNuevas.length === 0) {
      toast.error('Todas las personas del CSV ya existen en el genograma');
      return;
    }
    
    // Agregar las nuevas personas
    setPersonas(prev => [...prev, ...personasNuevas]);
    
    // Informar cuántas se agregaron y cuántas se ignoraron
    const ignoradas = personasImportadas.length - personasNuevas.length;
    
    if (ignoradas > 0) {
      toast.info(`Se importaron ${personasNuevas.length} personas. Se ignoraron ${ignoradas} por tener IDs duplicados.`);
    } else {
      toast.success(`Se importaron ${personasNuevas.length} personas correctamente`);
    }
    
    // Generar el genograma con las nuevas personas
    if (mermaidCode || personasNuevas.length > 0) {
      const updatedPersonas = [...personas, ...personasNuevas];
      handleGenerateGenograma(updatedPersonas, relaciones);
    }
  };

  const handleAddRelacion = (relacion: Relacion) => {
    // Verificar que existan ambas personas
    const personaOrigen = personas.find(p => p.id === relacion.idOrigen);
    const personaDestino = personas.find(p => p.id === relacion.idDestino);
    
    if (!personaOrigen || !personaDestino) {
      toast.error('Ambas personas deben existir en el genograma');
      return;
    }
    
    setRelaciones(prev => [...prev, relacion]);
    toast.success(`Relación agregada correctamente`);
  };

  const handleGenerateGenograma = (customPersonas = personas, customRelaciones = relaciones) => {
    if (customPersonas.length === 0) {
      toast.error('Debe agregar al menos una persona al genograma');
      return;
    }
    
    if (customRelaciones.length === 0) {
      toast.error('Debe agregar al menos una relación al genograma');
      return;
    }
    
    // Encontrar personas que tienen al menos una relación
    const personasConRelaciones = new Set<string>();
    
    customRelaciones.forEach(relacion => {
      personasConRelaciones.add(relacion.idOrigen);
      personasConRelaciones.add(relacion.idDestino);
    });
    
    // Filtrar solo las personas que tienen relaciones
    const personasAGraficar = customPersonas.filter(persona => 
      personasConRelaciones.has(persona.id)
    );
    
    // Si no hay personas con relaciones, mostrar un mensaje
    if (personasAGraficar.length === 0) {
      toast.error('No hay personas con relaciones para graficar');
      return;
    }
    
    let code = 'flowchart TD\n';
    
    // Definir estilos base con colores naturales
    code += '  classDef hombre fill:#ee6c4d ,stroke:#293241,stroke-width:2px\n';
    code += '  classDef mujer fill:#E1B16A,stroke:#8B6914,stroke-width:2px\n';
    code += '  classDef fallecido fill:#A9A9A9,stroke:#F6FAFF,stroke-width:2px,stroke-dasharray:5 5\n';
    code += '  classDef victima fill:#CE5A57,stroke:#8B0000,stroke-width:4px\n';
    code += '  classDef imputado fill:#F4E76E,stroke:#8B8000,stroke-width:4px\n';
    
    // Definir estilos para ramas familiares
    code += '  classDef ramaPrincipal fill:#8FB996,stroke:#1B4332,stroke-width:2px\n';
    code += '  classDef ramaPaterna fill:#9EC1CF,stroke:#2A4D69,stroke-width:2px\n';
    code += '  classDef ramaMaterna fill:#F9C5BD,stroke:#884A39,stroke-width:2px\n';
    code += '  classDef ramaPolitica fill:#F9E79F,stroke:#9A7D0A,stroke-width:2px\n';
    
    // Agregar ramas personalizadas si existen
    personasAGraficar.forEach(persona => {
      if (persona.ramaFamiliar === 'personalizada' && persona.nombreRama && persona.colorRama) {
        const nombreRama = persona.nombreRama.replace(/\s+/g, '');
        code += `  classDef rama${nombreRama} fill:${persona.colorRama},stroke:#333,stroke-width:2px\n`;
      }
    });
    
    // Agregar nodos (personas)
    personasAGraficar.forEach(persona => {
      // Determinar formato del nombre
      let nombreMostrar = persona.nombreCompleto || 
        [persona.nombre, persona.segundoNombre, persona.apellido, persona.segundoApellido]
          .filter(Boolean).join(' ');
          
      // Agregar indicador de rol especial si existe
      if (persona.rolEspecial && persona.rolEspecial !== 'ninguno') {
        nombreMostrar += `<br>${persona.rolEspecial.toUpperCase()}`;
      }
      
      // Agregar indicador de fallecido
      if (persona.esFallecido) {
        nombreMostrar += ' †';
      }
      
      // Determinar forma del nodo (masculino o femenino)
      const shape = persona.genero === 'masculino' ? '[' : '(';
      const closeShape = persona.genero === 'masculino' ? ']' : ')';
      
      code += `  ${persona.id}${shape}${nombreMostrar}${closeShape}`;
      
      // Aplicar clases en orden de prioridad
      const clases = [];
      
      // 1. Clase por género (base)
      clases.push(persona.genero === 'masculino' ? 'hombre' : 'mujer');
      
      // 2. Clase por rama familiar (si existe)
      if (persona.ramaFamiliar && persona.ramaFamiliar !== 'ninguna') {
        if (persona.ramaFamiliar === 'personalizada' && persona.nombreRama) {
          const nombreRama = persona.nombreRama.replace(/\s+/g, '');
          clases.push(`rama${nombreRama}`);
        } else {
          const nombreClaseRama = `rama${persona.ramaFamiliar.charAt(0).toUpperCase() + persona.ramaFamiliar.slice(1)}`;
          clases.push(nombreClaseRama);
        }
      }
      
      // 3. Clase por fallecimiento
      if (persona.esFallecido) {
        clases.push('fallecido');
      }
      
      // 4. Clase por rol especial
      if (persona.rolEspecial && persona.rolEspecial !== 'ninguno') {
        clases.push(persona.rolEspecial);
      }
      
      if (clases.length > 0) {
        code += `:::${clases.join('&')}`;
      }
      
      code += '\n';
    });
    
    // Agregar relaciones
    customRelaciones.forEach(relacion => {
      let connectionSymbol = '';
      let relationLabel = '';
      
      switch (relacion.tipo) {
        case 'matrimonio':
          connectionSymbol = '---|';
          relationLabel = '"Matrimonio"';
          break;
        case 'padres':
          connectionSymbol = '-->|';
          relationLabel = '"Padres"';
          break;
        case 'divorcio':
          connectionSymbol = '-.-|';
          relationLabel = '"Divorcio"';
          break;
        case 'hermanos':
          connectionSymbol = '-.->|';
          relationLabel = '"Hermanos"';
          break;
        case 'primos':
          connectionSymbol = '-.->|';
          relationLabel = '"Primos"';
          break;
        default:
          connectionSymbol = '---|';
          relationLabel = relacion.descripcion ? `"${relacion.descripcion}"` : '';
      }
      
      code += `  ${relacion.idOrigen} ${connectionSymbol}${relationLabel}| ${relacion.idDestino}\n`;
    });
    
    // Agregar un mensaje informativo si hay personas sin relaciones
    const personasSinRelaciones = customPersonas.length - personasAGraficar.length;
    if (personasSinRelaciones > 0) {
      code += '\n  %% Nota: ' + personasSinRelaciones + ' personas no se muestran porque no tienen relaciones\n';
      
      // También mostrar un mensaje visible al usuario
      toast.info(`${personasSinRelaciones} ${personasSinRelaciones === 1 ? 'persona no se muestra' : 'personas no se muestran'} en el genograma porque no ${personasSinRelaciones === 1 ? 'tiene' : 'tienen'} relaciones`);
    }
    
    setMermaidCode(code);
    return code;
  };
  
  const handleDeletePersona = (id: string) => {
    // Verificar si la persona tiene relaciones
    const tieneRelaciones = relaciones.some(
      rel => rel.idOrigen === id || rel.idDestino === id
    );
    
    if (tieneRelaciones) {
      const confirmar = window.confirm(
        "Esta persona tiene relaciones asociadas que también serán eliminadas. ¿Desea continuar?"
      );
      
      if (!confirmar) return;
      
      // Eliminar todas las relaciones asociadas a esta persona
      setRelaciones(prevRelaciones => 
        prevRelaciones.filter(rel => rel.idOrigen !== id && rel.idDestino !== id)
      );
    }
    
    // Eliminar la persona
    setPersonas(prevPersonas => prevPersonas.filter(persona => persona.id !== id));
    toast.success("Persona eliminada correctamente");
    
    // Si hay un código mermaid generado, actualizarlo
    if (mermaidCode) {
      handleGenerateGenograma();
    }
  };
  
  const handleDeleteRelacion = (index: number) => {
    setRelaciones(prevRelaciones => {
      const nuevasRelaciones = [...prevRelaciones];
      nuevasRelaciones.splice(index, 1);
      return nuevasRelaciones;
    });
    
    toast.success("Relación eliminada correctamente");
    
    // Si hay un código mermaid generado, actualizarlo
    if (mermaidCode) {
      handleGenerateGenograma();
    }
  };
  
  const handleSaveGenograma = async () => {
    if (!rucCausa) {
      toast.error('Debe ingresar el RUC de la causa para guardar el genograma');
      return;
    }
    
    if (personas.length === 0) {
      toast.error('Debe agregar al menos una persona al genograma para guardarlo');
      return;
    }
    
    setIsSaving(true);
    try {
      // Generar el código Mermaid si no existe
      const code = mermaidCode || handleGenerateGenograma();
      
      const response = await fetch('/api/genograma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rucCausa,
          personas,
          relaciones,
          mermaidCode: code
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar el genograma');
      
      const data = await response.json();
      
      // Actualizar la URL con el RUC si cambió
      if (rucCausa !== rucParam) {
        router.push(`/dashboard/genograma?ruc=${rucCausa}`);
      }
      
      toast.success(data.message || 'Genograma guardado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el genograma');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChangeRuc = (ruc: string) => {
    setRucCausa(ruc);
  };

  const handleLoadGenograma = (ruc: string) => {
    if (ruc === rucCausa && personas.length > 0) {
      toast.info('Este genograma ya está cargado');
      return;
    }
    
    // Actualizar el RUC y cargar el genograma
    setRucCausa(ruc);
    router.push(`/dashboard/genograma?ruc=${ruc}`);
    fetchGenograma(ruc);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Genograma Familiar</h1>
        <div className="flex items-center gap-3">
          <GenogramaSearch 
            onLoadGenograma={handleLoadGenograma} 
            isLoading={isLoading}
          />
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={personas.length === 0}
          >
            Nuevo Genograma
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GenogramaForm 
            onAddPersona={handleAddPersona} 
            onAddRelacion={handleAddRelacion}
            personas={personas}
            rucCausa={rucCausa}
            onChangeRuc={handleChangeRuc}
            onSaveGenograma={handleSaveGenograma}
            isSaving={isSaving}
          />
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => handleGenerateGenograma()} 
              variant="default"
            >
              Generar Genograma
            </Button>
            <Button 
              onClick={handleReset} 
              variant="destructive"
            >
              Reiniciar
            </Button>
            <CsvImportButton onImportPersonas={handleImportPersonas} />
          </div>
          
          {/* Lista de Personas */}
          <div className="border rounded-md overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personas" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50">
                  <div className="flex-1 text-left">
                    <h2 className="text-xl font-semibold">Personas Agregadas ({personas.length})</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-4 pb-4">
                  {personas.length === 0 ? (
                    <p className="text-slate-500 italic">No hay personas agregadas.</p>
                  ) : (
                    <ul className="space-y-2">
                      {personas.map(persona => (
                        <li key={persona.id} className="p-2 bg-slate-100 rounded-md flex justify-between items-start">
                          <div>
                            <strong>
                              {persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`}
                            </strong> 
                            {persona.esFallecido ? ' †' : ''} - 
                            {persona.genero === 'masculino' ? ' Hombre' : ' Mujer'} - 
                            {persona.rolEspecial !== 'ninguno' && 
                              <span className={`ml-1 font-semibold ${
                                persona.rolEspecial === 'victima' ? 'text-red-600' : 
                                persona.rolEspecial === 'imputado' ? 'text-amber-600' : ''
                              }`}>
                                {persona.rolEspecial.toUpperCase()}
                              </span>
                            } - 
                            {persona.ramaFamiliar !== 'ninguna' && 
                              <span className="ml-1">
                                Rama: {persona.ramaFamiliar === 'personalizada' ? persona.nombreRama : persona.ramaFamiliar}
                              </span>
                            } - 
                            ID: {persona.id}
                          </div>
                          <button 
                            onClick={() => handleDeletePersona(persona.id)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                            title="Eliminar persona"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          {/* Lista de Relaciones */}
          <div className="border rounded-md overflow-hidden mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="relaciones" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-slate-50">
                  <div className="flex-1 text-left">
                    <h2 className="text-xl font-semibold">Relaciones Agregadas ({relaciones.length})</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 px-4 pb-4">
                  {relaciones.length === 0 ? (
                    <p className="text-slate-500 italic">No hay relaciones agregadas.</p>
                  ) : (
                    <ul className="space-y-2">
                      {relaciones.map((relacion, index) => {
                        const personaOrigen = personas.find(p => p.id === relacion.idOrigen);
                        const personaDestino = personas.find(p => p.id === relacion.idDestino);
                        
                        return (
                          <li key={index} className="p-2 bg-slate-100 rounded-md flex justify-between items-start">
                            <div>
                              <strong>
                                {personaOrigen?.nombreCompleto || 
                                  `${personaOrigen?.nombre || ''} ${personaOrigen?.apellido || ''}`}
                                {personaOrigen?.esFallecido ? ' †' : ''}
                              </strong> 
                              <span className="mx-2">→</span>
                              <strong>
                                {personaDestino?.nombreCompleto || 
                                  `${personaDestino?.nombre || ''} ${personaDestino?.apellido || ''}`}
                                {personaDestino?.esFallecido ? ' †' : ''}
                              </strong> - 
                              Tipo: <span className="font-medium">{
                                relacion.tipo === 'otro' && relacion.descripcion 
                                  ? relacion.descripcion 
                                  : relacion.tipo.charAt(0).toUpperCase() + relacion.tipo.slice(1)
                              }</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteRelacion(index)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                              title="Eliminar relación"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h2 className="text-xl font-semibold mb-4">Visualización del Genograma</h2>
          <GenogramaViewer mermaidCode={mermaidCode} />
        </div>
      </div>
    </div>
  );
}