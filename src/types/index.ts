
export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  displayName?: string;
  createdAt?: string;
};

export type Expense = {
  id: string;
  amount: number;
  date: string;
  description?: string;
  categoryId: string;
  vehicleId?: string;
  createdAt: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
};

export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  active: boolean;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  checkSubscription: () => Promise<void>;
  logout: () => Promise<void>;
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string) => Promise<void>;
};

export type PeriodType = 'week' | 'month';
