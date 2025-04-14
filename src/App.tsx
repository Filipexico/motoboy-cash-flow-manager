import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Incomes from "./pages/Incomes";
import Expenses from "./pages/Expenses";
import Vehicles from "./pages/Vehicles";
import Refuelings from "./pages/Refuelings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import Landing from "./pages/Landing";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Tempo de carregamento excedido, forçando renderização");
        setTimeoutOccurred(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading && !timeoutOccurred) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          </div>
          <p className="text-gray-600">Carregando os dados...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated && !timeoutOccurred) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Tempo de carregamento excedido em AdminRoute, forçando renderização");
        setTimeoutOccurred(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading && !timeoutOccurred) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          </div>
          <p className="text-gray-600">Carregando dados do administrador...</p>
        </div>
      </div>
    );
  }
  
  if (!user?.isAdmin && !timeoutOccurred) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/empresas" element={
        <ProtectedRoute>
          <MainLayout>
            <Companies />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/rendimentos" element={
        <ProtectedRoute>
          <MainLayout>
            <Incomes />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/despesas" element={
        <ProtectedRoute>
          <MainLayout>
            <Expenses />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/veiculos" element={
        <ProtectedRoute>
          <MainLayout>
            <Vehicles />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/abastecimentos" element={
        <ProtectedRoute>
          <MainLayout>
            <Refuelings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/subscription" element={
        <ProtectedRoute>
          <MainLayout>
            <Subscription />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <AdminRoute>
          <MainLayout>
            <Admin />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
