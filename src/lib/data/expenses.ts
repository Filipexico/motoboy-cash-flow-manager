
import { v4 as uuidv4 } from 'uuid';
import { Expense } from '@/types';
import { expenseCategories } from './expense-categories';

// Helper to format date to ISO string
const formatDate = (date: Date): string => date.toISOString();

// Generate sample expenses for the last 4 weeks
const generateSampleExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() - dayOffset);
    
    // Add random expenses
    if (Math.random() > 0.5) { // 50% chance of having an expense on this day
      const categoryIndex = Math.floor(Math.random() * expenseCategories.length);
      
      expenses.push({
        id: uuidv4(),
        categoryId: expenseCategories[categoryIndex].id,
        amount: Math.floor(Math.random() * 100) + 20, // Random between 20-120
        date: formatDate(date),
        description: `Despesa com ${expenseCategories[categoryIndex].name}`,
        createdAt: formatDate(date)
      });
    }
  }
  
  return expenses;
};

// Create the sample data
export const expenses = generateSampleExpenses();

// Add expense
export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
  const newExpense: Expense = {
    ...expense,
    id: uuidv4(),
    createdAt: formatDate(new Date())
  };
  
  expenses.push(newExpense);
  return newExpense;
};
