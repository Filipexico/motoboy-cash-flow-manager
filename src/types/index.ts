
export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  active: boolean;
  createdAt: Date;
}

export interface Income {
  id: string;
  companyId: string;
  amount: number;
  weekStartDate: Date;
  weekEndDate: Date;
  description?: string;
  createdAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  active: boolean;
  createdAt: Date;
}

export interface Refueling {
  id: string;
  vehicleId: string;
  date: Date;
  odometerStart: number;
  odometerEnd: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  createdAt: Date;
}

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  kmDriven: number;
  fuelEfficiency: number; // km/L
  costPerKm: number;
}
