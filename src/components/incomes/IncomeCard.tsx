
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BanknoteIcon, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Income } from '@/types';
import { companies } from '@/lib/mock-data';

interface IncomeCardProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

const IncomeCard: React.FC<IncomeCardProps> = ({ income, onEdit, onDelete }) => {
  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Empresa desconhecida';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <BanknoteIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium">{getCompanyName(income.companyId)}</h3>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(income.weekStartDate), 'dd/MM', { locale: ptBR })} - {format(new Date(income.weekEndDate), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
            {income.description && (
              <p className="text-sm text-gray-600 mt-2">{income.description}</p>
            )}
          </div>
          <div className="text-lg font-bold text-green-600">
            {income.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(income)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(income)}>
            <Trash2 className="h-4 w-4 mr-1" /> Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeCard;
