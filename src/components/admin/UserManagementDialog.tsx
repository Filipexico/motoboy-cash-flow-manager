
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import CreateUserForm from './CreateUserForm';

interface UserManagementDialogProps {
  onUserCreated: () => void;
}

const UserManagementDialog = ({ onUserCreated }: UserManagementDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = () => {
    setOpen(false);
    onUserCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Adicione um novo usuário ao sistema. Você pode definir suas permissões e configurações iniciais.
          </DialogDescription>
        </DialogHeader>
        
        <CreateUserForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementDialog;
