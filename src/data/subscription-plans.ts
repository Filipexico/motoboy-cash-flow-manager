
export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlanData {
  id: 'free' | 'premium' | 'enterprise';
  title: string;
  description: string;
  price: number;
  features: PlanFeature[];
  isRecommended?: boolean;
}

export const subscriptionPlans: SubscriptionPlanData[] = [
  {
    id: 'free',
    title: 'Gratuito',
    description: 'Funcionalidades básicas para começar',
    price: 0,
    features: [
      { name: '1 empresa cadastrada', included: true },
      { name: '1 veículo cadastrado', included: true },
      { name: 'Acesso ao dashboard básico', included: true },
      { name: 'Registro de rendimentos e despesas', included: true },
      { name: 'Sem exportação para PDF', included: false },
      { name: 'Sem cálculo de custo por km', included: false },
    ],
  },
  {
    id: 'premium',
    title: 'Premium',
    description: 'O plano ideal para controle completo',
    price: 15,
    isRecommended: true,
    features: [
      { name: 'Empresas ilimitadas', included: true },
      { name: 'Veículos ilimitados', included: true },
      { name: 'Dashboard completo com análises', included: true },
      { name: 'Exportação para PDF', included: true },
      { name: 'Cálculo detalhado de custo por km', included: true },
      { name: 'Suporte prioritário', included: true },
    ],
  },
  {
    id: 'enterprise',
    title: 'Empresarial',
    description: 'Para frotas e equipes maiores',
    price: 99,
    features: [
      { name: 'Tudo do plano Premium', included: true },
      { name: 'Acesso para até 10 usuários', included: true },
      { name: 'Dashboard com KPIs avançados', included: true },
      { name: 'Relatórios personalizados', included: true },
      { name: 'API para integração com outros sistemas', included: true },
      { name: 'Suporte 24/7 dedicado', included: true },
    ],
  },
];
