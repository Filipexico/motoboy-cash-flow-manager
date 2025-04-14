
import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageHeader from '@/components/common/PageHeader';
import { expenses } from '@/lib/data/expenses';
import { expenseCategories } from '@/lib/data/expense-categories';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import PdfExportButton from '@/components/common/PdfExportButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Expense } from '@/types';

const Expenses = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const columns = [
    { header: 'Descrição', accessor: 'description' },
    { header: 'Categoria', accessor: 'categoryId', 
      format: (value: string) => {
        const category = expenseCategories.find(cat => cat.id === value);
        return category ? category.name : 'N/A';
      }
    },
    { header: 'Data', accessor: 'date', 
      format: (value: Date) => new Date(value).toLocaleDateString('pt-BR')
    },
    { header: 'Valor', accessor: 'amount', 
      format: (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
  ];
  
  const handleAddExpense = (data: Omit<Expense, "id" | "createdAt">) => {
    // Add company logic would be handled by the form component
    setOpen(false);
    toast({
      title: "Despesa registrada",
      description: "Despesa registrada com sucesso.",
    });
  };

  const handleAddClick = () => {
    if (!user?.isSubscribed && expenses.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de despesas do plano gratuito. Assine o plano Premium para adicionar mais despesas.",
        variant: "destructive",
      });
    } else {
      setOpen(true);
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Despesas"
        description="Gerencie suas despesas e custos operacionais"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {user?.isSubscribed && (
            <PdfExportButton 
              data={expenses}
              columns={columns}
              fileName="despesas"
              title="Relatório de Despesas"
            />
          )}
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Despesa</DialogTitle>
                <DialogDescription>
                  Preencha os dados para registrar uma nova despesa
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm onSuccess={handleAddExpense} />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Suas Despesas</CardTitle>
          <CardDescription>
            Lista de todas as despesas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={expenses} categories={expenseCategories} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
