
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Info, Truck, FileSpreadsheet, CreditCard, Settings, Car } from "lucide-react";

const FAQ = () => {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Bem-vindo à seção de perguntas frequentes do MotoControle. Aqui você encontrará respostas para as principais dúvidas sobre como utilizar a plataforma.
      </p>
      
      <Tabs defaultValue="getting-started" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="getting-started">Primeiros Passos</TabsTrigger>
          <TabsTrigger value="financial">Controle Financeiro</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="account">Conta e Assinatura</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Primeiros Passos
              </CardTitle>
              <CardDescription>
                Informações básicas para começar a usar o MotoControle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como começar a usar o MotoControle?</AccordionTrigger>
                  <AccordionContent>
                    <p>Após realizar o cadastro, você será direcionado ao Dashboard. Recomendamos seguir estes passos:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Cadastre seus veículos na seção "Veículos"</li>
                      <li>Adicione as empresas com as quais você trabalha em "Empresas"</li>
                      <li>Comece a registrar seus rendimentos e despesas</li>
                      <li>Acompanhe seus resultados no Dashboard</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Quais são as principais funcionalidades?</AccordionTrigger>
                  <AccordionContent>
                    <p>O MotoControle oferece diversas funcionalidades para facilitar sua gestão financeira:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Controle de rendimentos por semana e empresa</li>
                      <li>Registro de despesas por categoria e veículo</li>
                      <li>Gestão de abastecimentos e consumo de combustível</li>
                      <li>Relatórios e gráficos de desempenho</li>
                      <li>Exportação de dados em PDF</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Como navegar pela plataforma?</AccordionTrigger>
                  <AccordionContent>
                    <p>Use o menu lateral para acessar as diferentes seções do sistema:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li><strong>Dashboard:</strong> Visão geral dos seus dados financeiros</li>
                      <li><strong>Empresas:</strong> Cadastro de empresas parceiras</li>
                      <li><strong>Rendimentos:</strong> Registro de ganhos semanais</li>
                      <li><strong>Despesas:</strong> Controle de gastos</li>
                      <li><strong>Veículos:</strong> Gerenciamento da sua frota</li>
                      <li><strong>Abastecimentos:</strong> Registro de abastecimentos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                Controle Financeiro
              </CardTitle>
              <CardDescription>
                Como gerenciar seus rendimentos e despesas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como registrar meus rendimentos?</AccordionTrigger>
                  <AccordionContent>
                    <p>Para registrar seus rendimentos:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Acesse a seção "Rendimentos" no menu lateral</li>
                      <li>Clique no botão "Novo Rendimento"</li>
                      <li>Selecione a empresa (cadastre-a primeiro, se necessário)</li>
                      <li>Informe o período (data inicial e final da semana)</li>
                      <li>Digite o valor recebido e uma descrição opcional</li>
                      <li>Salve o registro</li>
                    </ol>
                    <p className="mt-2">Os rendimentos são organizados por mês e semana para facilitar o acompanhamento.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como categorizar minhas despesas?</AccordionTrigger>
                  <AccordionContent>
                    <p>O sistema já vem com categorias predefinidas para despesas comuns:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Combustível</li>
                      <li>Manutenção</li>
                      <li>Seguro</li>
                      <li>Impostos</li>
                      <li>Limpeza</li>
                      <li>Outros</li>
                    </ul>
                    <p className="mt-2">Ao registrar uma despesa, selecione a categoria apropriada e associe ao veículo correspondente quando aplicável. Isso permitirá análises mais detalhadas dos seus gastos.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Como analisar meu desempenho financeiro?</AccordionTrigger>
                  <AccordionContent>
                    <p>O Dashboard oferece uma visão geral do seu desempenho financeiro:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Gráficos comparativos de rendimentos e despesas</li>
                      <li>Resumo mensal e anual dos valores</li>
                      <li>Distribuição de despesas por categoria</li>
                      <li>Indicadores de desempenho por veículo</li>
                    </ul>
                    <p className="mt-2">Para uma análise mais detalhada, use os filtros disponíveis para visualizar dados por período específico ou veículo.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Veículos
              </CardTitle>
              <CardDescription>
                Gerenciamento e controle da sua frota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como cadastrar um novo veículo?</AccordionTrigger>
                  <AccordionContent>
                    <p>Para cadastrar um novo veículo:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Acesse a seção "Veículos" no menu lateral</li>
                      <li>Clique no botão "Novo Veículo"</li>
                      <li>Preencha os dados solicitados (marca, modelo, ano, placa)</li>
                      <li>Salve o cadastro</li>
                    </ol>
                    <p className="mt-2">Após cadastrar o veículo, você poderá associar despesas e abastecimentos a ele.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como registrar abastecimentos?</AccordionTrigger>
                  <AccordionContent>
                    <p>Para registrar um abastecimento:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Acesse a seção "Abastecimentos" no menu lateral</li>
                      <li>Clique no botão "Novo Abastecimento"</li>
                      <li>Selecione o veículo</li>
                      <li>Informe a data, quilometragem atual, litros e valor</li>
                      <li>Salve o registro</li>
                    </ol>
                    <p className="mt-2">O sistema calculará automaticamente o consumo médio e o custo por quilômetro.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Como acompanhar o desempenho dos veículos?</AccordionTrigger>
                  <AccordionContent>
                    <p>O MotoControle oferece diversas formas de acompanhar o desempenho dos seus veículos:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Consumo médio de combustível (km/l)</li>
                      <li>Custo por quilômetro rodado</li>
                      <li>Despesas totais por veículo</li>
                      <li>Histórico de manutenções</li>
                      <li>Gráficos de evolução de custos</li>
                    </ul>
                    <p className="mt-2">Essas informações ajudam a identificar oportunidades de economia e a planejar substituições na frota.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Conta e Assinatura
              </CardTitle>
              <CardDescription>
                Gerenciando sua conta e plano de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como atualizar meus dados pessoais?</AccordionTrigger>
                  <AccordionContent>
                    <p>Para atualizar seus dados pessoais:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Clique no seu nome/avatar no canto superior direito</li>
                      <li>Selecione "Perfil"</li>
                      <li>Atualize as informações desejadas</li>
                      <li>Clique em "Salvar alterações"</li>
                    </ol>
                    <p className="mt-2">Mantenha seus dados atualizados para receber notificações importantes sobre o sistema.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funciona o plano de assinatura?</AccordionTrigger>
                  <AccordionContent>
                    <p>O MotoControle oferece diferentes planos de assinatura:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li><strong>Plano Básico:</strong> Funcionalidades essenciais para controle financeiro</li>
                      <li><strong>Plano Profissional:</strong> Recursos avançados, incluindo relatórios detalhados</li>
                      <li><strong>Plano Empresarial:</strong> Ideal para frotas maiores, com suporte prioritário</li>
                    </ul>
                    <p className="mt-2">Acesse a seção "Assinatura" para conhecer os detalhes de cada plano e escolher o mais adequado às suas necessidades.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Como gerenciar minha assinatura?</AccordionTrigger>
                  <AccordionContent>
                    <p>Para gerenciar sua assinatura:</p>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Acesse a seção "Assinatura" no menu lateral</li>
                      <li>Visualize os detalhes do seu plano atual</li>
                      <li>Clique em "Alterar plano" para fazer upgrade ou downgrade</li>
                      <li>Use "Portal de pagamento" para atualizar formas de pagamento</li>
                    </ol>
                    <p className="mt-2">Você receberá notificações antes da renovação automática da sua assinatura.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Ainda tem dúvidas?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Se você tem dúvidas sobre como utilizar alguma funcionalidade específica, acesse nossos tutoriais em vídeo disponíveis na seção de Ajuda.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Pagamentos e Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Para dúvidas relacionadas a pagamentos, cobranças ou problemas com sua assinatura, entre em contato com nosso suporte financeiro.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <p className="text-center text-gray-600 mt-6">
          Se você não encontrou resposta para sua dúvida, entre em contato conosco pelo email <span className="text-blue-600">suporte@motocontrole.com.br</span>
        </p>
      </div>
    </div>
  );
};

export default FAQ;
