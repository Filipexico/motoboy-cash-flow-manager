
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
import VehicleForm from './VehicleForm';

interface VehicleDialogProps {
  trigger?: React.ReactNode;
}

const VehicleDialog: React.FC<VehicleDialogProps> = ({ trigger }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Veículo</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo veículo
          </DialogDescription>
        </DialogHeader>
        <VehicleForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDialog;
