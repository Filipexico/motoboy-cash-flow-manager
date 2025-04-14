
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
      retry: 1, // Reduz o número de tentativas para evitar loops longos
      refetchOnWindowFocus: false, // Desativa refetch automático
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Limitamos o tempo de carregamento para evitar ficar preso
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Tempo de carregamento excedido, forçando renderização");
        setTimeoutOccurred(true);
      }
    }, 5000); // 5 segundos de timeout
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading && !timeoutOccurred) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated && !timeoutOccurred) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Limitamos o tempo de carregamento para evitar ficar preso
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Tempo de carregamento excedido em AdminRoute, forçando renderização");
        setTimeoutOccurred(true);
      }
    }, 5000); // 5 segundos de timeout
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading && !timeoutOccurred) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!user?.isAdmin && !timeoutOccurred) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
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
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <MainLayout>
            <Admin />
          </MainLayout>
        </AdminRoute>
      } />
      
      {/* Not found route */}
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
