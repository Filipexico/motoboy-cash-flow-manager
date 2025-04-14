
import React, { useState } from 'react';
import { expenses, expenseCategories } from '@/lib/mock-data';
import { Expense, ExpenseCategory } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import PageHeader from '@/components/common/PageHeader';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Expenses = () => {
  const [expenseList, setExpenseList] = useState<Expense[]>(expenses);
  const [categories] = useState<ExpenseCategory[]>(expenseCategories);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  
  // Apply filters and sorting
  const filteredExpenses = expenseList
    .filter(expense => 
      filterCategory === 'all' ? true : expense.categoryId === filterCategory
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateSort === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
  // Calculate total for filtered expenses
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by month
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const month = format(new Date(expense.date), 'MMMM yyyy', { locale: ptBR });
    if (!groups[month]) groups[month] = [];
    groups[month].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
  
  // Calculate monthly totals
  const monthlyTotals = Object.entries(groupedExpenses).reduce((totals, [month, expenses]) => {
    totals[month] = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return totals;
  }, {} as Record<string, number>);
  
  // Handle form submission
  const handleSubmit = (formData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    setExpenseList([...expenseList, newExpense]);
    
    toast({
      title: "Despesa adicionada",
      description: "Sua despesa foi registrada com sucesso!",
    });
  };
  
  // Handle expense deletion
  const handleDelete = (id: string) => {
    setExpenseList(expenseList.filter(expense => expense.id !== id));
    
    toast({
      title: "Despesa removida",
      description: "A despesa foi removida com sucesso.",
    });
  };
  
  return (
    <div>
      <PageHeader 
        title="Despesas" 
        description="Gerencie e acompanhe suas despesas"
        actionLabel="Nova Despesa"
        onAction={() => document.getElementById('add-expense-trigger')?.click()}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={filterCategory} 
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={dateSort} 
            onValueChange={(value) => setDateSort(value as 'asc' | 'desc')}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais recentes primeiro</SelectItem>
              <SelectItem value="asc">Mais antigas primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold">
            Total: {filteredTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.entries(groupedExpenses).map(([month, monthExpenses]) => (
          <div key={month} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
              <h3 className="text-lg font-medium capitalize">{month}</h3>
              <span className="font-semibold">
                {monthlyTotals[month].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            
            <ExpenseList 
              expenses={monthExpenses} 
              categories={categories} 
              onDelete={handleDelete}
            />
          </div>
        ))}
        
        {Object.keys(groupedExpenses).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma despesa encontrada.</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => document.getElementById('add-expense-trigger')?.click()}
            >
              Adicionar despesa
            </Button>
          </div>
        )}
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button id="add-expense-trigger" className="hidden">Adicionar Despesa</Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Adicionar Despesa</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SheetClose asChild>
              <ExpenseForm 
                onSubmit={handleSubmit} 
              />
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Expenses;
