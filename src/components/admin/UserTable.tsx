
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
import { Shield, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
          <TableHead>Criado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name || user.email}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.isAdmin ? "default" : "secondary"}>
                {user.isAdmin ? "Administrador" : "Usuário"}
              </Badge>
            </TableCell>
            <TableCell>
              {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleAdmin(user.id, !user.isAdmin)}
                  disabled={user.id === currentUserId}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteUser(user.id)}
                  disabled={user.id === currentUserId}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
