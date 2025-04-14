
import React, { useState } from 'react';
import { BanknoteIcon, Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import PageHeader from '@/components/common/PageHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { incomes, companies, addIncome } from '@/lib/mock-data';
import { Income } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Form schema validation
const formSchema = z.object({
  companyId: z.string({
    required_error: "Selecione uma empresa",
  }),
  amount: z.coerce.number({
    required_error: "Informe o valor",
    invalid_type_error: "Valor deve ser um número",
  }).min(0.01, { message: "Valor deve ser maior que zero" }),
  weekStartDate: z.date({
    required_error: "Selecione a data de início da semana",
  }),
  weekEndDate: z.date({
    required_error: "Selecione a data de fim da semana",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Incomes = () => {
  const [incomeList, setIncomeList] = useState<Income[]>(incomes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: '',
      amount: 0,
      description: '',
    },
  });

  // Open dialog for adding a new income
  const handleAddClick = () => {
    form.reset({
      companyId: '',
      amount: 0,
      description: '',
      weekStartDate: new Date(),
      weekEndDate: new Date(),
    });
    setEditingIncome(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing an income
  const handleEditClick = (income: Income) => {
    form.reset({
      companyId: income.companyId,
      amount: income.amount,
      description: income.description || '',
      weekStartDate: new Date(income.weekStartDate),
      weekEndDate: new Date(income.weekEndDate),
    });
    setEditingIncome(income);
    setIsDialogOpen(true);
  };

  // Handle form submission (add or update)
  const onSubmit = (values: FormValues) => {
    if (editingIncome) {
      // Update existing income
      const updatedList = incomeList.map(item => 
        item.id === editingIncome.id 
          ? { ...item, ...values } 
          : item
      );
      setIncomeList(updatedList);
      toast({
        title: "Rendimento atualizado",
        description: "As informações do rendimento foram atualizadas com sucesso.",
      });
    } else {
      // Add new income - ensure all required fields are passed
      const newIncome = addIncome({
        companyId: values.companyId,
        amount: values.amount,
        weekStartDate: values.weekStartDate,
        weekEndDate: values.weekEndDate,
        description: values.description,
      });
      setIncomeList([...incomeList, newIncome]);
      toast({
        title: "Rendimento adicionado",
        description: "Novo rendimento foi adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
  };

  // Delete an income
  const handleDeleteClick = (income: Income) => {
    const updatedList = incomeList.filter(item => item.id !== income.id);
    setIncomeList(updatedList);
    toast({
      title: "Rendimento removido",
      description: "O rendimento foi removido com sucesso.",
    });
  };

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Empresa desconhecida';
  };

  // Get active companies for select
  const activeCompanies = companies.filter(company => company.active);

  return (
    <div>
      <PageHeader 
        title="Rendimentos" 
        description="Gerencie os rendimentos semanais por empresa" 
        actionLabel="Adicionar Rendimento"
        onAction={handleAddClick}
      />

      <div className="space-y-4">
        {/* Group incomes by month */}
        {Object.entries(incomeList
          .sort((a, b) => new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime())
          .reduce((groups, income) => {
            const month = format(new Date(income.weekEndDate), 'MMMM yyyy', { locale: ptBR });
            if (!groups[month]) groups[month] = [];
            groups[month].push(income);
            return groups;
          }, {} as Record<string, Income[]>))
          .map(([month, monthIncomes]) => (
            <div key={month}>
              <h3 className="font-medium text-gray-700 mb-2">{month.charAt(0).toUpperCase() + month.slice(1)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthIncomes.map(income => (
                  <Card key={income.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <BanknoteIcon className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="font-medium">{getCompanyName(income.companyId)}</h3>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {format(new Date(income.weekStartDate), 'dd/MM', { locale: ptBR })} - {format(new Date(income.weekEndDate), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          {income.description && (
                            <p className="text-sm text-gray-600 mt-2">{income.description}</p>
                          )}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {income.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(income)}>
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(income)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add income card */}
                <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full" onClick={handleAddClick}>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-center text-gray-600">Adicionar novo rendimento</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
      </div>

      {/* Dialog for adding/editing income */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Editar rendimento' : 'Adicionar novo rendimento'}
            </DialogTitle>
            <DialogDescription>
              {editingIncome 
                ? 'Altere as informações do rendimento conforme necessário.' 
                : 'Preencha as informações para adicionar um novo rendimento.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeCompanies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weekStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Início da semana</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="justify-start text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weekEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fim da semana</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="justify-start text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes adicionais sobre este rendimento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIncome ? 'Salvar alterações' : 'Adicionar rendimento'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Incomes;
