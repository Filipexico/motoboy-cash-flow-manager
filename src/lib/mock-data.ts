
import { v4 as uuidv4 } from 'uuid';
import { 
  Company, 
  Income, 
  ExpenseCategory, 
  Expense, 
  Vehicle, 
  Refueling,
  DashboardStats
} from '@/types';

// Sample companies
export const companies: Company[] = [
  {
    id: uuidv4(),
    name: 'iFood',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-01')
  },
  {
    id: uuidv4(),
    name: 'Uber Eats',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-05')
  },
  {
    id: uuidv4(),
    name: 'Rappi',
    logoUrl: 'https://placeholder.com/150x150',
    active: true,
    createdAt: new Date('2023-01-10')
  },
  {
    id: uuidv4(),
    name: '99 Food',
    logoUrl: 'https://placeholder.com/150x150',
    active: false,
    createdAt: new Date('2023-02-15')
  }
];

// Sample expense categories
export const expenseCategories: ExpenseCategory[] = [
  {
    id: uuidv4(),
    name: 'Combustível',
    icon: 'fuel'
  },
  {
    id: uuidv4(),
    name: 'Manutenção',
    icon: 'wrench'
  },
  {
    id: uuidv4(),
    name: 'Alimentação',
    icon: 'utensils'
  },
  {
    id: uuidv4(),
    name: 'Seguro',
    icon: 'shield'
  },
  {
    id: uuidv4(),
    name: 'Prestação da Moto',
    icon: 'motorcycle'
  },
  {
    id: uuidv4(),
    name: 'Outros',
    icon: 'ellipsis'
  }
];

// Sample vehicles
export const vehicles: Vehicle[] = [
  {
    id: uuidv4(),
    name: 'Minha Moto Principal',
    model: 'Honda CG 160',
    year: 2020,
    licensePlate: 'ABC1234',
    active: true,
    createdAt: new Date('2023-01-01')
  },
  {
    id: uuidv4(),
    name: 'Moto Reserva',
    model: 'Yamaha Factor 125',
    year: 2019,
    licensePlate: 'XYZ5678',
    active: false,
    createdAt: new Date('2023-02-15')
  }
];

// Generate sample incomes for the last 4 weeks
const generateSampleIncomes = (): Income[] => {
  const incomes: Income[] = [];
  const now = new Date();
  
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const weekEndDate = new Date(now);
    weekEndDate.setDate(now.getDate() - (weekOffset * 7));
    
    const weekStartDate = new Date(weekEndDate);
    weekStartDate.setDate(weekEndDate.getDate() - 6);
    
    // Add income for each company
    companies.forEach(company => {
      if (company.active) {
        incomes.push({
          id: uuidv4(),
          companyId: company.id,
          amount: Math.floor(Math.random() * 800) + 400, // Random between 400-1200
          weekStartDate,
          weekEndDate,
          description: `Ganhos da semana ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
          createdAt: weekEndDate
        });
      }
    });
  }
  
  return incomes;
};

// Generate sample expenses for the last 4 weeks
const generateSampleExpenses = (): Expense[] => {
  const expenses: Expense[] = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() - dayOffset);
    
    // Add random expenses
    if (Math.random() > 0.5) { // 50% chance of having an expense on this day
      const categoryIndex = Math.floor(Math.random() * expenseCategories.length);
      
      expenses.push({
        id: uuidv4(),
        categoryId: expenseCategories[categoryIndex].id,
        amount: Math.floor(Math.random() * 100) + 20, // Random between 20-120
        date,
        description: `Despesa com ${expenseCategories[categoryIndex].name}`,
        createdAt: date
      });
    }
  }
  
  return expenses;
};

// Generate sample refuelings for the last 4 weeks
const generateSampleRefuelings = (): Refueling[] => {
  const refuelings: Refueling[] = [];
  const now = new Date();
  let lastOdometer = 25000; // Starting odometer for the first vehicle
  
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (weekOffset * 7));
    
    const odometerEnd = lastOdometer + Math.floor(Math.random() * 300) + 200; // 200-500 km per week
    const liters = Math.floor(Math.random() * 10) + 10; // 10-20 liters
    const pricePerLiter = 4.5 + (Math.random() * 1); // Between 4.5 and 5.5 per liter
    
    refuelings.push({
      id: uuidv4(),
      vehicleId: vehicles[0].id, // Main vehicle
      date,
      odometerStart: lastOdometer,
      odometerEnd,
      liters,
      pricePerLiter,
      totalCost: liters * pricePerLiter,
      createdAt: date
    });
    
    lastOdometer = odometerEnd;
  }
  
  return refuelings;
};

// Create the sample data
export const incomes = generateSampleIncomes();
export const expenses = generateSampleExpenses();
export const refuelings = generateSampleRefuelings();

// Calculation helpers
export const calculateDashboardStats = (
  periodStartDate: Date,
  periodEndDate: Date
): DashboardStats => {
  // Filter data for the given period
  const periodIncomes = incomes.filter(income => 
    income.weekEndDate >= periodStartDate && income.weekStartDate <= periodEndDate
  );
  
  const periodExpenses = expenses.filter(expense => 
    expense.date >= periodStartDate && expense.date <= periodEndDate
  );
  
  const periodRefuelings = refuelings.filter(refueling => 
    refueling.date >= periodStartDate && refueling.date <= periodEndDate
  );
  
  // Calculate totals
  const totalIncome = periodIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  // Calculate distances and fuel efficiency
  let kmDriven = 0;
  let totalLiters = 0;
  
  periodRefuelings.forEach(refueling => {
    kmDriven += (refueling.odometerEnd - refueling.odometerStart);
    totalLiters += refueling.liters;
  });
  
  const fuelEfficiency = totalLiters > 0 ? kmDriven / totalLiters : 0;
  const costPerKm = kmDriven > 0 ? 
    periodRefuelings.reduce((sum, r) => sum + r.totalCost, 0) / kmDriven : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    kmDriven,
    fuelEfficiency,
    costPerKm
  };
};

export const getLastWeekData = (): DashboardStats => {
  const now = new Date();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - 7);
  
  return calculateDashboardStats(lastWeekStart, now);
};

export const getLastMonthData = (): DashboardStats => {
  const now = new Date();
  const lastMonthStart = new Date(now);
  lastMonthStart.setDate(now.getDate() - 30);
  
  return calculateDashboardStats(lastMonthStart, now);
};

// Add a company
export const addCompany = (company: Omit<Company, 'id' | 'createdAt'>): Company => {
  const newCompany: Company = {
    ...company,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  companies.push(newCompany);
  return newCompany;
};

// Add income
export const addIncome = (income: Omit<Income, 'id' | 'createdAt'>): Income => {
  const newIncome: Income = {
    ...income,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  incomes.push(newIncome);
  return newIncome;
};

// Add expense
export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
  const newExpense: Expense = {
    ...expense,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  expenses.push(newExpense);
  return newExpense;
};

// Add vehicle
export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
  const newVehicle: Vehicle = {
    ...vehicle,
    id: uuidv4(),
    createdAt: new Date()
  };
  
  vehicles.push(newVehicle);
  return newVehicle;
};

// Add refueling
export const addRefueling = (refueling: Omit<Refueling, 'id' | 'createdAt' | 'totalCost'>): Refueling => {
  const totalCost = refueling.liters * refueling.pricePerLiter;
  
  const newRefueling: Refueling = {
    ...refueling,
    id: uuidv4(),
    totalCost,
    createdAt: new Date()
  };
  
  refuelings.push(newRefueling);
  return newRefueling;
};
