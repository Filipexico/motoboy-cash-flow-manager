
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { incomes, addIncome } from '@/lib/mock-data';
import { Income } from '@/types';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import IncomeDialog from '@/components/incomes/IncomeDialog';
import MonthIncomeGroup from '@/components/incomes/MonthIncomeGroup';
import { IncomeFormValues } from '@/components/incomes/IncomeForm';

const Incomes = () => {
  const [incomeList, setIncomeList] = useState<Income[]>(incomes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { toast } = useToast();
  
  // Open dialog for adding a new income
  const handleAddClick = () => {
    setEditingIncome(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing an income
  const handleEditClick = (income: Income) => {
    setEditingIncome(income);
    setIsDialogOpen(true);
  };

  // Handle form submission (add or update)
  const onSubmit = (values: IncomeFormValues) => {
    if (editingIncome) {
      // Update existing income
      const updatedList = incomeList.map(item => 
        item.id === editingIncome.id 
          ? { 
              ...item, 
              companyId: values.companyId,
              amount: values.amount,
              weekStartDate: values.weekStartDate instanceof Date ? values.weekStartDate.toISOString() : values.weekStartDate,
              weekEndDate: values.weekEndDate instanceof Date ? values.weekEndDate.toISOString() : values.weekEndDate,
              description: values.description,
            } 
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
        weekStartDate: values.weekStartDate instanceof Date ? values.weekStartDate.toISOString() : values.weekStartDate,
        weekEndDate: values.weekEndDate instanceof Date ? values.weekEndDate.toISOString() : values.weekEndDate,
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

  // Group incomes by month
  const groupedIncomes = incomeList
    .sort((a, b) => new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime())
    .reduce((groups, income) => {
      const month = format(new Date(income.weekEndDate), 'MMMM yyyy', { locale: ptBR });
      if (!groups[month]) groups[month] = [];
      groups[month].push(income);
      return groups;
    }, {} as Record<string, Income[]>);

  return (
    <div>
      <PageHeader 
        title="Rendimentos" 
        description="Gerencie os rendimentos semanais por empresa" 
        actionLabel="Adicionar Rendimento"
        onAction={handleAddClick}
      />

      <div className="space-y-4">
        {Object.entries(groupedIncomes).map(([month, monthIncomes]) => (
          <MonthIncomeGroup
            key={month}
            month={month}
            incomes={monthIncomes}
            onAddClick={handleAddClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      <IncomeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        editingIncome={editingIncome}
      />
    </div>
  );
};

export default Incomes;
