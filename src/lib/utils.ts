
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

export function formatAddressToJSON(address: any): string | object {
  // Se já for uma string JSON ou um objeto, retornar como está
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (e) {
      return address;
    }
  }
  
  // Se for um objeto, retorná-lo diretamente
  if (typeof address === 'object' && address !== null) {
    return address;
  }
  
  // Caso contrário, retornar um objeto vazio
  return {};
}
