
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';

interface UserRoleBadgeProps {
  isAdmin: boolean;
}

const UserRoleBadge = ({ isAdmin }: UserRoleBadgeProps) => {
  if (isAdmin) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Administrador
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
      <User className="h-3 w-3" />
      Usuário
    </Badge>
  );
};

export default UserRoleBadge;
