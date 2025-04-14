
import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import { expenses, addExpense } from '@/lib/data/expenses';
import { ExpenseCategory, Expense } from '@/types';
import { expenseCategories } from '@/lib/data/expense-categories';

const Expenses = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const handleAddExpense = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const newExpense = addExpense(data);
      toast({
        title: 'Despesa adicionada',
        description: 'A despesa foi cadastrada com sucesso.',
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a despesa.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Despesas"
        description="Gerencie suas despesas e categoria de gastos"
      >
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </PageHeader>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ExpenseList 
            expenses={expenses} 
            categories={expenseCategories}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <ExpenseList 
            expenses={expenses.slice().sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 10)} 
            categories={expenseCategories}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenseCategories.map(category => {
              const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
              const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{category.name}</h3>
                    <span className="text-lg font-bold text-blue-600">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {categoryExpenses.length} despesas nesta categoria
                  </p>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          <ExpenseForm 
            categories={expenseCategories} 
            onSubmit={handleAddExpense} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
