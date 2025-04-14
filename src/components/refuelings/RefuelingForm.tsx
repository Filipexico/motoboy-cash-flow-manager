
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Refueling } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRefueling } from '@/lib/data/refuelings';
import { vehicles } from '@/lib/data/vehicles';
import { useToast } from '@/hooks/use-toast';

// Define form schema with validation
const refuelingFormSchema = z.object({
  date: z.date(),
  vehicleId: z.string().min(1, "Selecione um veículo"),
  odometerStart: z.coerce.number().nonnegative("Valor deve ser positivo"),
  odometerEnd: z.coerce.number().nonnegative("Valor deve ser positivo"),
  liters: z.coerce.number().positive("Valor deve ser positivo"),
  pricePerLiter: z.coerce.number().positive("Valor deve ser positivo"),
});

type RefuelingFormValues = z.infer<typeof refuelingFormSchema>;

interface RefuelingFormProps {
  onSuccess?: () => void;
}

const RefuelingForm: React.FC<RefuelingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [totalCost, setTotalCost] = useState(0);
  const [distance, setDistance] = useState(0);
  const [efficiency, setEfficiency] = useState(0);

  const form = useForm<RefuelingFormValues>({
    resolver: zodResolver(refuelingFormSchema),
    defaultValues: {
      date: new Date(),
      vehicleId: '',
      odometerStart: 0,
      odometerEnd: 0,
      liters: 0,
      pricePerLiter: 0,
    },
  });

  // Calculate derived values
  useEffect(() => {
    const liters = form.watch('liters') || 0;
    const pricePerLiter = form.watch('pricePerLiter') || 0;
    const odometerStart = form.watch('odometerStart') || 0;
    const odometerEnd = form.watch('odometerEnd') || 0;

    const calculatedDistance = Math.max(0, odometerEnd - odometerStart);
    const calculatedCost = liters * pricePerLiter;
    const calculatedEfficiency = liters > 0 ? calculatedDistance / liters : 0;

    setDistance(calculatedDistance);
    setTotalCost(calculatedCost);
    setEfficiency(calculatedEfficiency);
  }, [form.watch('liters'), form.watch('pricePerLiter'), form.watch('odometerStart'), form.watch('odometerEnd')]);

  const onSubmit = (values: RefuelingFormValues) => {
    // Ensure all required fields are present (not optional)
    const refuelingData: Omit<Refueling, "id" | "createdAt" | "totalCost"> = {
      date: values.date,
      vehicleId: values.vehicleId,
      odometerStart: values.odometerStart,
      odometerEnd: values.odometerEnd,
      liters: values.liters,
      pricePerLiter: values.pricePerLiter,
      totalCost: totalCost,
    };
    
    addRefueling(refuelingData);
    
    toast({
      title: "Abastecimento registrado",
      description: `Abastecimento de ${values.liters.toFixed(2)}L foi registrado com sucesso!`,
    });
    
    form.reset();
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
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
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    {vehicles.filter(v => v.active).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormLabel>Preço por Litro</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Distância</p>
              <p className="font-medium">{distance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-gray-500">Rendimento</p>
              <p className="font-medium">{efficiency.toFixed(1)} km/L</p>
            </div>
            <div>
              <p className="text-gray-500">Custo Total</p>
              <p className="font-medium">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          Registrar Abastecimento
        </Button>
      </form>
    </Form>
  );
};

export default RefuelingForm;
