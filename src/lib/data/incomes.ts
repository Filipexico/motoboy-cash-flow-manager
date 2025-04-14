
import { v4 as uuidv4 } from 'uuid';
import { Income } from '@/types';
import { companies } from './companies';

// Generate sample incomes for the last 4 weeks
const generateSampleIncomes = (): Income[] => {
  const incomes: Income[] = [];
  const now = new Date();
  
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const weekEndDate = new Date(now);
    weekEndDate.setDate(now.getDate() - (weekOffset * 7));
    
    const weekStartDate = new Date(weekEndDate);
    weekStartDate.setDate(weekEndDate.getDate() - 6);
    
    // Add income for each company
    companies.forEach(company => {
      if (company.active) {
        incomes.push({
          id: uuidv4(),
          companyId: company.id,
          amount: Math.floor(Math.random() * 800) + 400, // Random between 400-1200
          weekStartDate,
          weekEndDate,
          description: `Ganhos da semana ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
          createdAt: weekEndDate
        });
      }
    });
  }
  
  return incomes;
};

// Create the sample data
export const incomes = generateSampleIncomes();

// Add income
export const addIncome = (income: Omit<Income, 'id' | 'createdAt'>): Income => {
  const newIncome: Income = {
    ...income,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  incomes.push(newIncome);
  return newIncome;
};
