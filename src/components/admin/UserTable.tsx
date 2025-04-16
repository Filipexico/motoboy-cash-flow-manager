
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, User, Check, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTableProps {
  users: any[];
  currentUserId: string;
  onDeleteUser: (userId: string) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
}

const UserTable = ({ users, currentUserId, onDeleteUser, onToggleAdmin }: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Assinatura</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
              Nenhum usuário encontrado. Verifique o console para erros.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || user.email}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.isAdmin ? "default" : "secondary"}>
                  {user.isAdmin ? "Administrador" : "Usuário"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isSubscribed ? "success" : "outline"}>
                  {user.isSubscribed ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleAdmin(user.id, !user.isAdmin)}
                          disabled={user.id === currentUserId}
                        >
                          {user.isAdmin ? (
                            <Ban className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {user.isAdmin ? 'Remover privilégios de administrador' : 'Conceder privilégios de administrador'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteUser(user.id)}
                          disabled={user.id === currentUserId}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Excluir usuário
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
