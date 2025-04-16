
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, Trash, UserCog } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import UserRoleBadge from './UserRoleBadge';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  currentUserId: string;
  isUpdatingRole: string | null;
  isDeleting: string | null;
  onToggleAdmin: (userId: string, currentStatus: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onToggleSubscription: (userId: string, currentStatus: boolean) => Promise<void>;
}

const UserTable = ({
  users,
  currentUserId,
  isUpdatingRole,
  isDeleting,
  onToggleAdmin,
  onDeleteUser,
  onToggleSubscription
}: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Assinante</TableHead>
          <TableHead>Fim da Assinatura</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              {u.createdAt ? format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <UserRoleBadge isAdmin={u.isAdmin} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => onToggleAdmin(u.id, u.isAdmin)}
                  disabled={isUpdatingRole === u.id || u.id === currentUserId}
                >
                  {isUpdatingRole === u.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCog className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${u.isSubscribed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                onClick={() => onToggleSubscription(u.id, u.isSubscribed)}
              >
                {u.isSubscribed ? <span>✓</span> : <span>✗</span>}
              </Button>
            </TableCell>
            <TableCell>
              {u.subscriptionEnd 
                ? format(new Date(u.subscriptionEnd), 'dd/MM/yyyy', { locale: ptBR })
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    disabled={isDeleting === u.id || u.id === currentUserId}
                  >
                    {isDeleting === u.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o usuário <strong>{u.name}</strong>? 
                      Esta ação não pode ser desfeita e todos os dados associados serão removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => onDeleteUser(u.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
