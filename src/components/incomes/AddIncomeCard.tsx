
import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AddIncomeCardProps {
  onClick: () => void;
}

const AddIncomeCard: React.FC<AddIncomeCardProps> = ({ onClick }) => {
  return (
    <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
      <CardContent className="p-6 flex flex-col items-center justify-center h-full" onClick={onClick}>
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <p className="text-center text-gray-600">Adicionar novo rendimento</p>
      </CardContent>
    </Card>
  );
};

export default AddIncomeCard;
