
import { DashboardStats } from '@/types';
import { incomes } from './incomes';
import { expenses } from './expenses';
import { refuelings } from './refuelings';

// Calculation helpers
export const calculateDashboardStats = (
  periodStartDate: Date,
  periodEndDate: Date
): DashboardStats => {
  // Filter data for the given period
  const periodIncomes = incomes.filter(income => {
    const incomeWeekEnd = new Date(income.weekEndDate);
    const incomeWeekStart = new Date(income.weekStartDate);
    return incomeWeekEnd >= periodStartDate && incomeWeekStart <= periodEndDate;
  });
  
  const periodExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= periodStartDate && expenseDate <= periodEndDate;
  });
  
  const periodRefuelings = refuelings.filter(refueling => {
    const refuelingDate = new Date(refueling.date);
    return refuelingDate >= periodStartDate && refuelingDate <= periodEndDate;
  });
  
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
