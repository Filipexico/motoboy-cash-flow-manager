
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

export function formatAddressToJSON(address: any): object {
  // Se for uma string, tentar converter para objeto
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (e) {
      console.error('Error parsing address string:', e);
      // Fallback: criar objeto com a string como valor de street
      return { street: address, city: '', state: '', zipcode: '', country: '' };
    }
  }
  
  // Se já for um objeto, garantir que tenha a estrutura correta
  if (typeof address === 'object' && address !== null) {
    // Garantir que todos os campos existam
    const validAddress = {
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipcode: address.zipcode || '',
      country: address.country || 'Brasil'
    };
    
    return validAddress;
  }
  
  // Caso contrário, retornar um objeto vazio com estrutura válida
  return { street: '', city: '', state: '', zipcode: '', country: '' };
}
