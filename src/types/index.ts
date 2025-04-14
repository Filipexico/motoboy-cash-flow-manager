
export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  displayName?: string;
  createdAt?: string;
  name?: string; // Added for backward compatibility
  subscriptionEndDate?: string; // Added for backward compatibility
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
  icon?: string; // Added for backward compatibility
};

export type Vehicle = {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  active: boolean;
  createdAt?: string; // Added for backward compatibility
};

export type Company = {
  id: string;
  name: string;
  logoUrl?: string;
  active: boolean;
  createdAt: string;
};

export type Income = {
  id: string;
  companyId: string;
  amount: number;
  weekStartDate: string;
  weekEndDate: string;
  description?: string;
  createdAt: string;
};

export type Refueling = {
  id: string;
  vehicleId: string;
  date: string;
  odometerStart: number;
  odometerEnd: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  createdAt: string;
};

export type DashboardStats = {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  kmDriven: number;
  fuelEfficiency: number; // km/L
  costPerKm: number;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  checkSubscription: () => Promise<void>;
  logout: () => Promise<void>;
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
};

export type PeriodType = 'week' | 'month';
