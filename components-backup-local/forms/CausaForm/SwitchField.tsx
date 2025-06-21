import React from 'react';
import { Switch } from '@/components/ui/switch';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface SwitchFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

// Cambiamos a export default
const SwitchField: React.FC<SwitchFieldProps> = ({ form, name, label }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default SwitchField;
