
import { Expense } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { expenses as mockExpenses } from '@/lib/data/expenses';

// Variável para armazenar as despesas em memória durante a sessão
let localExpenses: Expense[] = [...mockExpenses];

// Carregar despesas do usuário atual
export const loadUserExpenses = async (): Promise<Expense[]> => {
  try {
    // Como não podemos usar o Supabase para 'expenses', usamos dados locais
    return localExpenses;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return [];
  }
};

// Adicionar uma nova despesa
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  try {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };

    // Adicionar à nossa coleção local
    localExpenses = [...localExpenses, newExpense];
    
    return newExpense;
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return null;
  }
};

// Atualizar uma despesa existente
export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<boolean> => {
  try {
    // Encontrar e atualizar a despesa no array local
    const index = localExpenses.findIndex(item => item.id === id);
    
    if (index >= 0) {
      localExpenses[index] = {
        ...localExpenses[index],
        ...expense,
        updatedAt: new Date().toISOString()
      };
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    return false;
  }
};

// Excluir uma despesa
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    // Filtra o array local removendo a despesa com o ID correspondente
    const initialLength = localExpenses.length;
    localExpenses = localExpenses.filter(expense => expense.id !== id);
    
    // Verifica se algo foi removido
    return localExpenses.length < initialLength;
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    return false;
  }
};

// Limpar todas as despesas (útil para novos usuários)
export const clearAllExpenses = (): void => {
  localExpenses = [];
};

// Redefinir para os dados mock (útil para demonstração)
export const resetToMockData = (): void => {
  localExpenses = [...mockExpenses];
};
