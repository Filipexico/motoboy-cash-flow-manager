
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addRefueling } from '@/lib/data/refuelings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehicles } from '@/lib/data/vehicles';
import { Refueling } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Form schema validation
const formSchema = z.object({
  vehicleId: z.string().min(1, { message: 'Selecione um veículo' }),
  date: z.string().min(1, { message: 'Data é obrigatória' }),
  odometerStart: z.coerce.number().min(0, { message: 'Valor inválido' }),
  odometerEnd: z.coerce.number().min(0, { message: 'Valor inválido' }),
  liters: z.coerce.number().min(0.1, { message: 'Valor inválido' }),
  pricePerLiter: z.coerce.number().min(0.1, { message: 'Valor inválido' }),
});

type FormData = z.infer<typeof formSchema>;

interface RefuelingFormProps {
  onSuccess?: () => void;
}

const RefuelingForm: React.FC<RefuelingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: '',
      date: new Date().toISOString().split('T')[0],
      odometerStart: 0,
      odometerEnd: 0,
      liters: 0,
      pricePerLiter: 0,
    },
  });
  
  const onSubmit = (data: FormData) => {
    try {
      // Convert string date to Date object
      const dateParts = data.date.split('-');
      const dateObj = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1, 
        parseInt(dateParts[2])
      );
      
      // Validate that end odometer is greater than start
      if (data.odometerEnd <= data.odometerStart) {
        form.setError('odometerEnd', {
          type: 'manual',
          message: 'O odômetro final deve ser maior que o inicial',
        });
        return;
      }
      
      // Add refueling to the database
      addRefueling({
        vehicleId: data.vehicleId,
        date: dateObj,
        odometerStart: data.odometerStart,
        odometerEnd: data.odometerEnd,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
      });
      
      toast({
        title: "Abastecimento registrado",
        description: `Abastecimento de ${data.liters} litros adicionado com sucesso.`,
      });
      
      // Reset form and call success callback
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o abastecimento.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veículo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="odometerStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Odômetro inicial (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="odometerEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Odômetro final (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Litros</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pricePerLiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço por litro (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full mt-4">Salvar</Button>
      </form>
    </Form>
  );
};

export default RefuelingForm;
