
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
    console.log('formatAddressToJSON - input:', address);
    console.log('formatAddressToJSON - tipo:', typeof address);
    
    // Se já for um objeto válido, retornar diretamente
    if (typeof address === 'object' && address !== null) {
      const result = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipcode: address.zipcode || '',
        country: address.country || 'Brasil'
      };
      console.log('formatAddressToJSON - resultado como objeto:', result);
      return result;
    }
    
    // Se for string, tentar converter para objeto
    if (typeof address === 'string') {
      try {
        console.log('formatAddressToJSON - convertendo string para objeto');
        const parsed = JSON.parse(address);
        return formatAddressToJSON(parsed);
      } catch (e) {
        console.error('Erro ao converter endereço de string para objeto:', e);
      }
    }
    
    // Caso não seja válido, retornar estrutura vazia
    console.log('formatAddressToJSON - retornando estrutura vazia padrão');
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  } catch (error) {
    console.error('Erro ao formatar endereço:', error);
    return { street: '', city: '', state: '', zipcode: '', country: 'Brasil' };
  }
}
