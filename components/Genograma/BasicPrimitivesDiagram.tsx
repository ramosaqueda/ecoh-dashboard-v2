'use client';

import React from "react";
import { FamDiagram } from "basicprimitivesreact";
import { PageFitMode, Enabled, GroupByType, ConnectorAnnotationConfig, AnnotationType, LineType, Colors } from "basicprimitives";

import { Persona, Relacion } from "./types";

// Import BasicPrimitives CSS
import "basicprimitives/css/primitives.css"; 

interface BasicPrimitivesDiagramProps {
  personas: Persona[];
  relaciones: Relacion[];
  className?: string; // Optional className
  style?: React.CSSProperties; // Optional style
}

const BasicPrimitivesDiagram: React.FC<BasicPrimitivesDiagramProps> = ({
  personas,
  relaciones,
  className,
  style,
}) => {
  // Transform domain data to BasicPrimitives ItemConfig
  const config = React.useMemo(() => {
    const items = personas.map((p) => {
      // Find parents for this person
      const parents = relaciones
        .filter((r) => r.idDestino === p.id && (r.tipo === 'padres'))
        .map((r) => r.idOrigen);

      return {
        id: p.id,
        title: p.nombreCompleto || `${p.nombre} ${p.apellido}`,
        description: `ID: ${p.id} ${p.esFallecido ? '(Fallecido)' : ''}`, // Show ID instead of gender
        parents: parents.length > 0 ? parents : [],
        itemTitleColor: p.genero === 'masculino' ? '#4169e1' : '#e141ac', 
        image: p.fotoUrl || undefined,
      };
    });

    // Create annotations for relationships
    const annotations = relaciones.map((r) => {
        if (r.tipo === 'padres') {
            return null; // Skip hierarchy lines from manual annotations
        }

        const annotation: ConnectorAnnotationConfig = {
            annotationType: AnnotationType.Connector,
            fromItem: r.idOrigen,
            toItem: r.idDestino,
            label: r.descripcion || r.tipo,
            labelSize: { width: 100, height: 20 },
            connectorShapeType: 5, // 5 = OneWay
            color: Colors.Black,
            lineWidth: 2,
            lineType: LineType.Dashed,
            selectItems: false,
        };
        return annotation;
    }).filter((a): a is ConnectorAnnotationConfig => a !== null);

    return {
      items,
      annotations,
      pageFitMode: PageFitMode.None,
      cursorItem: null,
      hasSelectorCheckbox: Enabled.True,
      linesWidth: 1,
      linesColor: "black",
      normalLevelShift: 20,
      dotLevelShift: 20,
      lineLevelShift: 10,
      normalItemsInterval: 10,
      dotItemsInterval: 10,
      lineItemsInterval: 10,
      arrowsDirection: GroupByType.Parents,
      showExtraArrows: false,
      enablePanning: false, 
    };
  }, [personas, relaciones]);

  const defaultStyle: React.CSSProperties = { height: "600px", width: "100%", border: "1px solid #ddd" };
  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <div className={className} style={{ ...combinedStyle, position: 'relative' }}>
      <FamDiagram config={config as any} style={{ width: '100%', height: '100%' }} /> 
    </div>
  );
};

export default BasicPrimitivesDiagram;
