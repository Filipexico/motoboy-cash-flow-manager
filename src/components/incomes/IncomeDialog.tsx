
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import IncomeForm, { IncomeFormValues } from './IncomeForm';
import { Income } from '@/types';

interface IncomeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: IncomeFormValues) => void;
  editingIncome: Income | null;
}

const IncomeDialog: React.FC<IncomeDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  editingIncome
}) => {
  const defaultValues = editingIncome ? {
    companyId: editingIncome.companyId,
    amount: editingIncome.amount,
    weekStartDate: new Date(editingIncome.weekStartDate),
    weekEndDate: new Date(editingIncome.weekEndDate),
    description: editingIncome.description || '',
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        <IncomeForm 
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isEditing={!!editingIncome}
        />
      </DialogContent>
    </Dialog>
  );
};

export default IncomeDialog;
