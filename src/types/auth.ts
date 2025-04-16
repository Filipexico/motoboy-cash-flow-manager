
import { User } from './index';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  checkSubscription: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>; // Changed from Promise<void> to Promise<any>
  register: (email: string, password: string, name?: string) => Promise<any>; // Changed from Promise<void> to Promise<any>
}
