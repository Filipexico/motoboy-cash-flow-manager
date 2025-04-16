
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface AdminStatsProps {
  users: User[];
}

const AdminStats = ({ users }: AdminStatsProps) => {
  return (
    <>
      <Badge variant="outline" className="text-sm px-2 py-1">
        {users.length} Usuário(s)
      </Badge>
      <Badge variant="outline" className="text-sm px-2 py-1">
        {users.filter(u => u.isSubscribed).length} Assinante(s)
      </Badge>
    </>
  );
};

export default AdminStats;
