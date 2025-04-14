
import React, { useState } from 'react';
import { 
  BarChart, 
  BarChartBig, 
  CalendarDays, 
  DollarSign, 
  TriangleAlert, 
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatCard from '@/components/common/StatCard';
import PageHeader from '@/components/common/PageHeader';
import { 
  companies, 
  incomes, 
  expenses, 
  expenseCategories, 
  refuelings,
  getLastWeekData,
  getLastMonthData
} from '@/lib/mock-data';
import { PeriodType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [period, setPeriod] = useState<PeriodType>('week');
  const { toast } = useToast();
  
  // Get stats based on selected period
  const stats = period === 'week' ? getLastWeekData() : getLastMonthData();
  
  // Prepare income data for chart
  const incomeData = companies.map(company => {
    const companyIncomes = incomes.filter(income => income.companyId === company.id);
    const total = companyIncomes.reduce((sum, income) => sum + income.amount, 0);
    
    return {
      name: company.name,
      valor: total
    };
  }).filter(item => item.valor > 0);
  
  // Prepare expense data for chart
  const expenseData = expenseCategories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      valor: total
    };
  }).filter(item => item.valor > 0);
  
  // Prepare refueling data
  const refuelingData = refuelings.map(refueling => {
    return {
      date: new Date(refueling.date).toLocaleDateString('pt-BR'),
      km: refueling.odometerEnd - refueling.odometerStart,
      liters: refueling.liters,
      efficiency: ((refueling.odometerEnd - refueling.odometerStart) / refueling.liters).toFixed(2)
    };
  });
  
  // Calculate the balance (income - expenses)
  const balance = stats.totalIncome - stats.totalExpenses;
  
  // Pie chart colors
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899'];
  
  const handleExportPDF = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seu relatório em PDF será gerado em breve.",
    });
  };
  
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral das suas finanças e métricas de desempenho"
      >
        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar relatório
        </Button>
      </PageHeader>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Faturamento Total"
          value={stats.totalIncome}
          icon={<DollarSign className="h-5 w-5" />}
          description={`Período: ${period === 'week' ? 'Última semana' : 'Último mês'}`}
          trend={5.2}
          isCurrency
        />
        
        <StatCard
          title="Despesas Totais"
          value={stats.totalExpenses}
          icon={<TriangleAlert className="h-5 w-5" />}
          description={`Período: ${period === 'week' ? 'Última semana' : 'Último mês'}`}
          trend={-2.1}
          isCurrency
        />
        
        <StatCard
          title="Lucro Líquido"
          value={stats.netProfit}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`Período: ${period === 'week' ? 'Última semana' : 'Último mês'}`}
          trend={7.5}
          isCurrency
        />
        
        <StatCard
          title="Custo por KM"
          value={stats.costPerKm}
          icon={<BarChart className="h-5 w-5" />}
          description={`Km/L: ${stats.fuelEfficiency.toFixed(2)}`}
          isCurrency
        />
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="summary" className="mb-6">
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="income">Rendimentos</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Balanço Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Faturamento</span>
                      <span className="font-medium text-green-600">
                        {stats.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Despesas</span>
                      <span className="font-medium text-red-600">
                        {stats.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Saldo</span>
                        <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Distribuição de Despesas</h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="valor"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {expenseData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Income */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Rendimentos Recentes</h4>
                    <div className="space-y-2">
                      {incomes.slice(0, 3).map(income => {
                        const company = companies.find(c => c.id === income.companyId);
                        return (
                          <div key={income.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <p className="text-sm font-medium">{company?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(income.weekEndDate).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-green-600">
                              {income.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Recent Expenses */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Despesas Recentes</h4>
                    <div className="space-y-2">
                      {expenses.slice(0, 3).map(expense => {
                        const category = expenseCategories.find(c => c.id === expense.categoryId);
                        return (
                          <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <p className="text-sm font-medium">{category?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(expense.date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-red-600">
                              {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChartBig className="h-5 w-5 text-blue-500" />
                Rendimentos por Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={incomeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor" fill="#3B82F6" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChartBig className="h-5 w-5 text-blue-500" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={expenseData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor" fill="#EF4444" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChartBig className="h-5 w-5 text-blue-500" />
                Desempenho do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Quilometragem Total"
                    value={stats.kmDriven}
                    description="Quilômetros percorridos"
                  />
                  
                  <StatCard
                    title="Eficiência Média"
                    value={stats.fuelEfficiency.toFixed(2)}
                    description="Km/Litro"
                  />
                  
                  <StatCard
                    title="Custo por KM"
                    value={stats.costPerKm}
                    isCurrency
                    description="Valor médio por Km"
                  />
                </div>
                
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={refuelingData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="km" name="Quilômetros" fill="#3B82F6" />
                      <Bar yAxisId="right" dataKey="efficiency" name="Km/Litro" fill="#10B981" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
