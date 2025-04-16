
import { User } from './index';
import { RegisterFormValues } from './userProfile';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  initialCheckDone?: boolean; // Added to track initial auth check
  user: User | null;
  checkSubscription: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (formValues: RegisterFormValues) => Promise<any>;
}
