
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Incomes from "./pages/Incomes";
import Expenses from "./pages/Expenses";
import Vehicles from "./pages/Vehicles";
import Refuelings from "./pages/Refuelings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/empresas" element={
            <MainLayout>
              <Companies />
            </MainLayout>
          } />
          <Route path="/rendimentos" element={
            <MainLayout>
              <Incomes />
            </MainLayout>
          } />
          <Route path="/despesas" element={
            <MainLayout>
              <Expenses />
            </MainLayout>
          } />
          <Route path="/veiculos" element={
            <MainLayout>
              <Vehicles />
            </MainLayout>
          } />
          <Route path="/abastecimentos" element={
            <MainLayout>
              <Refuelings />
            </MainLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
