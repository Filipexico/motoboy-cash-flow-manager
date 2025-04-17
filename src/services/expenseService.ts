
import { supabase } from '@/lib/supabase';
import { Expense } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Carregar despesas do usuário atual
export const loadUserExpenses = async (): Promise<Expense[]> => {
  try {
    const { data: userExpenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar despesas:', error);
      return [];
    }

    return userExpenses || [];
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

    const { data, error } = await supabase
      .from('expenses')
      .insert([newExpense])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar despesa:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return null;
  }
};

// Atualizar uma despesa existente
export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update({
        ...expense,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar despesa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    return false;
  }
};

// Excluir uma despesa
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir despesa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    return false;
  }
};
