import React from 'react';
import { Handle, Position } from 'reactflow';
import { Building, User, FileText } from 'lucide-react';

interface CustomNodeProps {
  data: {
    name: string;
    role: string;
    emoji: string;
    type: string;
    photoUrl?: string | null;
    delito?: string;
  };
  isConnectable: boolean;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, isConnectable }) => {
  // Función para manejar errores de imagen con type safety
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const img = e.currentTarget; // Usar currentTarget para mejor type safety
    
    // Verificar si ya se intentó el placeholder
    if (img.src.includes('placeholder-person.png')) {
      // Si el placeholder también falla, reemplazar con icono
      const parent = img.parentElement;
      if (parent) {
        parent.innerHTML = `
          <div class="w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-green-700">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        `;
      }
    } else {
      // Primer intento: usar imagen placeholder
      img.onerror = null; // Prevenir loop infinito
      img.src = '/placeholder-person.png';
    }
  };

  // Determinar colores según el tipo de nodo
  let bgColor = 'bg-gray-100';
  let borderColor = 'border-gray-500';
  let textColor = 'text-gray-900';
  let icon: React.ReactNode = null;

  switch (data.type) {
    case 'organization':
      bgColor = 'bg-blue-100';
      borderColor = 'border-blue-500';
      textColor = 'text-blue-900';
      icon = <Building className="w-6 h-6 text-blue-700" />;
      break;
    case 'imputado':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-500';
      textColor = 'text-green-900';
      icon = data.photoUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-600">
          <img 
            src={data.photoUrl} 
            alt={data.name} 
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      ) : (
        <User className="w-6 h-6 text-green-700" />
      );
      break;
    case 'causa':
      bgColor = 'bg-orange-100';
      borderColor = 'border-orange-500';
      textColor = 'text-orange-900';
      icon = <FileText className="w-6 h-6 text-orange-700" />;
      break;
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${borderColor} ${bgColor} min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-gray-500 w-3 h-3"
      />
      <div className="flex flex-col items-center">
        <div className="mb-2">
          {icon || <span className="text-2xl">{data.emoji}</span>}
        </div>
        <div className={`font-bold ${textColor} text-center`}>{data.name}</div>
        <div className="text-xs mt-1 text-center">
          {data.role}
        </div>
        
        {/* Mostrar delito para nodos de tipo causa */}
        {data.type === 'causa' && data.delito && (
          <div className="mt-1 text-xs bg-orange-200 px-2 py-0.5 rounded-full text-orange-800">
            {data.delito}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-gray-500 w-3 h-3"
      />
    </div>
  );
};

export default CustomNode;