import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CausaFormData } from '@/schemas/causaSchema';

interface FormDebuggerProps {
  form: UseFormReturn<CausaFormData>;
  initialValues?: Partial<CausaFormData>;
}

export const FormDebugger: React.FC<FormDebuggerProps> = ({ form, initialValues }) => {
  const [showDebug, setShowDebug] = React.useState(false);
  
  const currentValues = form.watch();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
      >
        🔍 Debug Form
      </button>
      
      {showDebug && (
        <div className="mt-2 bg-black text-white p-4 rounded max-w-md max-h-96 overflow-auto text-xs">
          <h3 className="font-bold mb-2">Form Debug Info</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-yellow-300">Initial Values:</h4>
            <pre className="text-green-300">
              origenCausaId: {JSON.stringify(initialValues?.origenCausaId, null, 2)}
            </pre>
            <pre className="text-green-300">
              estadoCausaId: {JSON.stringify(initialValues?.estadoCausaId, null, 2)}
            </pre>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-yellow-300">Current Form Values:</h4>
            <pre className="text-blue-300">
              origenCausaId: {JSON.stringify(currentValues.origenCausaId, null, 2)}
            </pre>
            <pre className="text-blue-300">
              estadoCausaId: {JSON.stringify(currentValues.estadoCausaId, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-yellow-300">String Values for Selectors:</h4>
            <pre className="text-purple-300">
              origen: '{currentValues.origenCausaId ? currentValues.origenCausaId.toString() : ''}'
            </pre>
            <pre className="text-purple-300">
              estado: '{currentValues.estadoCausaId ? currentValues.estadoCausaId.toString() : ''}'
            </pre>
          </div>
          
          <button
            onClick={() => {
              console.log('🔍 MANUAL DEBUG:', {
                initialValues,
                currentValues: {
                  origenCausaId: currentValues.origenCausaId,
                  estadoCausaId: currentValues.estadoCausaId
                },
                stringValues: {
                  origen: currentValues.origenCausaId ? currentValues.origenCausaId.toString() : '',
                  estado: currentValues.estadoCausaId ? currentValues.estadoCausaId.toString() : ''
                }
              });
            }}
            className="mt-2 bg-green-600 px-2 py-1 rounded text-xs"
          >
            Log to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default FormDebugger;
