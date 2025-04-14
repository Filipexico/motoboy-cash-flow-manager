
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Company } from '@/types';
import CompanyForm from './CompanyForm';

interface CompanyFormData {
  name: string;
  active: boolean;
}

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyFormData;
  onChange: (company: CompanyFormData) => void;
  onSubmit: () => void;
  editMode: boolean;
}

const CompanyDialog: React.FC<CompanyDialogProps> = ({
  open,
  onOpenChange,
  company,
  onChange,
  onSubmit,
  editMode
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Editar empresa' : 'Adicionar nova empresa'}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? 'Altere as informações da empresa conforme necessário.' 
              : 'Preencha as informações para adicionar uma nova empresa.'}
          </DialogDescription>
        </DialogHeader>
        <CompanyForm company={company} onChange={onChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {editMode ? 'Salvar alterações' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDialog;
