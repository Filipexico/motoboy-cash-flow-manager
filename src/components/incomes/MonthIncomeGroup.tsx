
import React from 'react';
import { Income } from '@/types';
import IncomeCard from './IncomeCard';
import AddIncomeCard from './AddIncomeCard';

interface MonthIncomeGroupProps {
  month: string;
  incomes: Income[];
  onAddClick: () => void;
  onEditClick: (income: Income) => void;
  onDeleteClick: (income: Income) => void;
}

const MonthIncomeGroup: React.FC<MonthIncomeGroupProps> = ({
  month,
  incomes,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-2">{month.charAt(0).toUpperCase() + month.slice(1)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incomes.map(income => (
          <IncomeCard 
            key={income.id}
            income={income}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
          />
        ))}
        <AddIncomeCard onClick={onAddClick} />
      </div>
    </div>
  );
};

export default MonthIncomeGroup;
