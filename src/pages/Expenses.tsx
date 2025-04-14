
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const Expenses = () => {
  const [expenseList, setExpenseList] = useState<Expense[]>(expenses);
  const [categories] = useState<ExpenseCategory[]>(expenseCategories);
  const { toast } = useToast();
  
  // Group expenses by month for display
  const groupedExpenses = expenseList.reduce<Record<string, Expense[]>>((groups, expense) => {
    const date = new Date(expense.date);
    const monthYear = format(date, 'MMMM yyyy', { locale: ptBR });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(expense);
    return groups;
  }, {});
  
  // Sort expenses by date (newest first) within each group
  Object.keys(groupedExpenses).forEach(month => {
    groupedExpenses[month].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
  
  // Get sorted months
  const sortedMonths = Object.keys(groupedExpenses).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Calculate total expenses
  const totalExpenses = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Handle form submission
  const handleSubmit = (formData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...formData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    
    setExpenseList([...expenseList, newExpense]);
    
    toast({
      title: 'Despesa adicionada',
      description: 'A despesa foi adicionada com sucesso.',
    });
  };
  
  // Handle expense deletion
  const handleDelete = (id: string) => {
    setExpenseList(expenseList.filter(expense => expense.id !== id));
    
    toast({
      title: 'Despesa excluída',
      description: 'A despesa foi excluída com sucesso.',
    });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Despesas" 
        description="Gerencie e acompanhe suas despesas"
        actionLabel="Nova Despesa"
        onAction={() => document.getElementById('add-expense-trigger')?.click()}
      />
      
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-muted-foreground">Total de despesas</p>
        </CardContent>
      </Card>
      
      {/* Tabs for expense list */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {sortedMonths.map(month => (
            <div key={month} className="space-y-2">
              <h3 className="text-lg font-medium capitalize">{month}</h3>
              <ExpenseList 
                expenses={groupedExpenses[month]} 
                categories={categories}
              />
            </div>
          ))}
          
          {sortedMonths.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => {
              const categoryExpenses = expenseList.filter(
                expense => expense.categoryId === category.id
              );
              const categoryTotal = categoryExpenses.reduce(
                (sum, expense) => sum + expense.amount, 0
              );
              
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {categoryTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <p className="text-muted-foreground">{categoryExpenses.length} despesas</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Expense Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <div id="add-expense-trigger" className="hidden">Open</div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nova Despesa</SheetTitle>
            <SheetDescription>
              Adicione uma nova despesa ao seu controle financeiro.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SheetClose asChild>
              <ExpenseForm 
                categories={categories} 
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
