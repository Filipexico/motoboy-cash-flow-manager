
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
export function formatAddressToJSON(address: any): Record<string, string> {
  try {
    console.log('formatAddressToJSON - input:', address);
    console.log('formatAddressToJSON - tipo:', typeof address);
    
    // Estrutura padrão para endereço
    const defaultAddress: Record<string, string> = {
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: 'Brasil'
    };
    
    // Se for null ou undefined, retornar estrutura vazia
    if (address === null || address === undefined) {
      console.log('formatAddressToJSON - endereço nulo ou undefined, retornando estrutura vazia');
      return defaultAddress;
    }
    
    // Se já for um objeto válido, retornar estrutura padronizada
    if (typeof address === 'object' && address !== null) {
      const result: Record<string, string> = {
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
        // Verificar se a string está vazia
        if (!address.trim()) {
          console.log('formatAddressToJSON - string vazia, retornando estrutura vazia');
          return defaultAddress;
        }
        
        console.log('formatAddressToJSON - convertendo string para objeto');
        let parsed;
        try {
          parsed = JSON.parse(address);
        } catch (e) {
          console.error('Erro ao converter endereço de string para objeto:', e);
          return defaultAddress;
        }
        
        // Recursivamente formatar o objeto parsed
        return formatAddressToJSON(parsed);
      } catch (e) {
        console.error('Erro ao processar string de endereço:', e);
        return defaultAddress;
      }
    }
    
    // Caso não seja válido, retornar estrutura vazia
    console.log('formatAddressToJSON - tipo não reconhecido, retornando estrutura vazia padrão');
    return defaultAddress;
  } catch (error) {
    console.error('Erro ao formatar endereço:', error);
    return {
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: 'Brasil'
    };
  }
}
