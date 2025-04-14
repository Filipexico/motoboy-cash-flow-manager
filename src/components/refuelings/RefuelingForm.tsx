
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRefueling } from '@/lib/data/refuelings';
import { vehicles } from '@/lib/data/vehicles';
import { useToast } from '@/hooks/use-toast';

const refuelingFormSchema = z.object({
  vehicleId: z.string().min(1, 'Selecione um veículo'),
  date: z.date({
    required_error: 'Selecione uma data',
  }),
  odometerStart: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  odometerEnd: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  liters: z.coerce.number().min(0.1, 'Valor deve ser maior que 0'),
  pricePerLiter: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
});

type RefuelingFormValues = z.infer<typeof refuelingFormSchema>;

interface RefuelingFormProps {
  onSuccess?: () => void;
}

const RefuelingForm: React.FC<RefuelingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const form = useForm<RefuelingFormValues>({
    resolver: zodResolver(refuelingFormSchema),
    defaultValues: {
      date: new Date(),
      odometerStart: 0,
      odometerEnd: 0,
      liters: 0,
      pricePerLiter: 0,
    },
  });

  const watchOdometerEnd = form.watch('odometerEnd');
  const watchOdometerStart = form.watch('odometerStart');
  const watchLiters = form.watch('liters');
  const watchPricePerLiter = form.watch('pricePerLiter');
  
  // Calculate
  const distance = watchOdometerEnd - watchOdometerStart;
  const efficiency = distance > 0 && watchLiters > 0 ? distance / watchLiters : 0;
  const totalCost = watchLiters * watchPricePerLiter;
  
  const onSubmit = (data: RefuelingFormValues) => {
    try {
      // Add the refueling to our data store
      addRefueling(data);
      
      // Show success toast
      toast({
        title: 'Abastecimento registrado',
        description: `Abastecimento de ${data.liters.toFixed(2)}L registrado com sucesso.`,
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding refueling:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao registrar o abastecimento.',
        variant: 'destructive',
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.filter(v => v.active).map(vehicle => (
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
            <FormItem className="flex flex-col">
              <FormLabel>Data do Abastecimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
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
                <FormLabel>Odômetro Inicial (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
                <FormLabel>Odômetro Final (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
                <FormLabel>Preço por Litro (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="rounded-md border p-4 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Distância:</p>
              <p className="text-xl">{distance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-sm font-medium">Rendimento:</p>
              <p className="text-xl">{efficiency.toFixed(1)} km/L</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Custo Total:</p>
            <p className="text-xl">
              {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
        
        <Button type="submit" className="w-full">Registrar Abastecimento</Button>
      </form>
    </Form>
  );
};

export default RefuelingForm;
