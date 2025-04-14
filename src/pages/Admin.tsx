
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, 
  Trash, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { users, makeUserAdmin, updateUserSubscription } from '@/lib/data/users';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Redirect if not admin (this is a backup, we also check in App.tsx routes)
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const handleToggleAdmin = (userId: string, currentStatus: boolean) => {
    const result = makeUserAdmin(userId, !currentStatus);
    if (result) {
      toast({
        title: 'Status alterado',
        description: `Usuário ${result.name} ${!currentStatus ? 'promovido a administrador' : 'rebaixado de administrador'}.`,
      });
    }
  };

  const handleToggleSubscription = (userId: string, currentStatus: boolean) => {
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
    
    const result = updateUserSubscription(userId, !currentStatus, !currentStatus ? endDate : undefined);
    if (result) {
      toast({
        title: 'Assinatura alterada',
        description: `Assinatura de ${result.name} ${!currentStatus ? 'ativada' : 'cancelada'}.`,
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Administração"
        description="Gerencie usuários, assinaturas e configurações do sistema"
      >
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm px-2 py-1">
            {users.length} Usuário(s)
          </Badge>
          <Badge variant="outline" className="text-sm px-2 py-1">
            {users.filter(u => u.isSubscribed).length} Assinante(s)
          </Badge>
        </div>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Admin</TableHead>
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
                    {format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full ${u.isAdmin ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                    >
                      {u.isAdmin ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full ${u.isSubscribed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                      onClick={() => handleToggleSubscription(u.id, u.isSubscribed)}
                    >
                      {u.isSubscribed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {u.subscriptionEndDate 
                      ? format(new Date(u.subscriptionEndDate), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      disabled={u.id === user?.id} // Can't delete yourself
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
