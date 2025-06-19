import React from 'react';
import {
  FormControl,
  FormField as UIFormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

// Cambiamos a export default
const FormField: React.FC<FormFieldProps> = ({
  form,
  name,
  label,
  required = false,
  children
}) => {
  return (
    <UIFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            {React.cloneElement(children as React.ReactElement, { ...field })}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
