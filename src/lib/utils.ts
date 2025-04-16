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
    // Se já for um objeto válido, retornar diretamente
    if (typeof address === 'object' && address !== null) {
      return {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: address.zipcode || '',
        country: address.country || 'Brasil'
      };
    }
    
    // Se for string, tentar converter para objeto
    if (typeof address === 'string') {
      try {
        return formatAddressToJSON(JSON.parse(address));
      } catch (e) {
        console.error('Erro ao converter endereço de string para objeto:', e);
      }
    }
    
    // Caso não seja válido, retornar estrutura vazia
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  } catch (error) {
    console.error('Erro ao formatar endereço:', error);
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  }
}
