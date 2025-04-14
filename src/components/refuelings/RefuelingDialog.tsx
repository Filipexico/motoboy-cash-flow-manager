
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import RefuelingForm from './RefuelingForm';

interface RefuelingDialogProps {
  trigger?: React.ReactNode;
}

const RefuelingDialog: React.FC<RefuelingDialogProps> = ({ trigger }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Abastecimento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar um novo abastecimento
          </DialogDescription>
        </DialogHeader>
        <RefuelingForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default RefuelingDialog;
