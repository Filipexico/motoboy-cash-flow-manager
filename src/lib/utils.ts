
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Converte um objeto de endereço ou string em um formato JSON compatível com o Supabase
 * Esta função garante que o endereço esteja no formato correto para ser armazenado no banco de dados
 */
export function formatAddressToJSON(address: any): any {
  try {
    // Se for string, tentar converter para objeto
    if (typeof address === 'string') {
      try {
        // Verificar se já é uma string JSON válida
        return JSON.parse(address);
      } catch (e) {
        console.error('Erro ao converter endereço de string para objeto:', e);
        // Fallback: criar um objeto com valores padrão
        return { 
          street: address || '', 
          city: '', 
          state: '', 
          zipcode: '', 
          country: 'Brasil' 
        };
      }
    }
    
    // Se já for um objeto, garantir a estrutura correta
    if (typeof address === 'object' && address !== null) {
      // Criar uma cópia sanitizada do objeto para evitar referências
      const validAddress = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: address.zipcode || '',
        country: address.country || 'Brasil'
      };
      
      return validAddress;
    }
    
    // Caso não seja nem string nem objeto, retornar estrutura vazia
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  } catch (error) {
    console.error('Erro ao formatar endereço:', error);
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  }
}
