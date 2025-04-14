
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { addVehicle } from '@/lib/data/vehicles';
import { useToast } from '@/hooks/use-toast';

const vehicleFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  model: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres'),
  year: z.coerce.number().min(1970, 'Ano deve ser maior que 1970').max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(5, 'Placa deve ter pelo menos 5 caracteres'),
  active: z.boolean().default(true),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSuccess?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      active: true,
    },
  });
  
  const onSubmit = (data: VehicleFormValues) => {
    try {
      // Add the vehicle to our data store
      addVehicle(data);
      
      // Show success toast
      toast({
        title: 'Veículo adicionado',
        description: `${data.name} foi adicionado com sucesso.`,
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao adicionar o veículo.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Veículo</FormLabel>
              <FormControl>
                <Input placeholder="ex: Minha Moto Principal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="ex: Honda CG 160" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano</FormLabel>
              <FormControl>
                <Input type="number" placeholder="ex: 2021" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input placeholder="ex: ABC1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Veículo Ativo</FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Salvar Veículo</Button>
      </form>
    </Form>
  );
};

export default VehicleForm;
