
import { v4 as uuidv4 } from 'uuid';
import { ExpenseCategory } from '@/types';

// Sample expense categories
export const expenseCategories: ExpenseCategory[] = [
  {
    id: uuidv4(),
    name: 'Combustível',
    icon: 'fuel'
  },
  {
    id: uuidv4(),
    name: 'Manutenção',
    icon: 'wrench'
  },
  {
    id: uuidv4(),
    name: 'Alimentação',
    icon: 'utensils'
  },
  {
    id: uuidv4(),
    name: 'Seguro',
    icon: 'shield'
  },
  {
    id: uuidv4(),
    name: 'Prestação da Moto',
    icon: 'motorcycle'
  },
  {
    id: uuidv4(),
    name: 'Outros',
    icon: 'ellipsis'
  }
];
