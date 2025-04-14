
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseList from '@/components/expenses/ExpenseList';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import PdfExportButton from '@/components/common/PdfExportButton';
import PageHeader from '@/components/common/PageHeader';
import { expenses, expenseCategories, vehicles } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Expense } from '@/types';

const Expenses = () => {
  const [expenseList, setExpenseList] = useState<Expense[]>(expenses);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Filter expenses based on selected filters
  const filteredExpenses = expenseList.filter(expense => {
    const categoryMatch = filterCategory === 'all' || expense.categoryId === filterCategory;
    const vehicleMatch = filterVehicle === 'all' || expense.vehicleId === filterVehicle;
    
    let periodMatch = true;
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    
    if (filterPeriod === 'month') {
      periodMatch = (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    } else if (filterPeriod === 'year') {
      periodMatch = expenseDate.getFullYear() === currentDate.getFullYear();
    }
    
    return categoryMatch && vehicleMatch && periodMatch;
  });
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Handle adding a new expense
  const handleAddExpense = (data: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    
    setExpenseList(prev => [newExpense, ...prev]);
    setIsDialogOpen(false);
    
    toast({
      title: 'Despesa adicionada',
      description: 'A despesa foi adicionada com sucesso.',
    });
  };
  
  // Columns for PDF export
  const pdfColumns = [
    { header: 'Data', accessor: 'date', format: (value: string) => format(new Date(value), 'dd/MM/yyyy') },
    { header: 'Categoria', accessor: 'categoryId', format: (value: string) => {
      const category = expenseCategories.find(cat => cat.id === value);
      return category ? category.name : 'Categoria Desconhecida';
    }},
    { header: 'Veículo', accessor: 'vehicleId', format: (value: string) => {
      const vehicle = vehicles.find(v => v.id === value);
      return vehicle ? vehicle.nickname || vehicle.model : 'Veículo Desconhecido';
    }},
    { header: 'Descrição', accessor: 'description' },
    { header: 'Valor (R$)', accessor: 'amount', format: (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Despesas"
        description="Gerencie todas as suas despesas"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {user?.isSubscribed && (
            <PdfExportButton
              data={filteredExpenses}
              columns={pdfColumns}
              fileName="despesas"
              title="Relatório de Despesas"
              subtitle={`Total: ${totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
            />
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Despesa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova despesa ao seu controle financeiro.
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {expenseCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Veículo</label>
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Período</label>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <ExpenseList 
            expenses={filteredExpenses} 
            total={totalExpenses}
            onEdit={(id) => console.log(`Edit expense ${id}`)}
            onDelete={(id) => {
              setExpenseList(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
              toast({
                title: 'Despesa removida',
                description: 'A despesa foi removida com sucesso.',
              });
            }}
          />
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Total por Categoria</h3>
              {/* Category summary table here */}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Total por Veículo</h3>
              {/* Vehicle summary table here */}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expenses;
