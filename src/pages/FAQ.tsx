
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Info, HelpCircle, DollarSign, LayoutDashboard, CalendarDays, TrendingUp, TruckIcon } from 'lucide-react';

const FAQ = () => {
  return (
    <div>
      <PageHeader 
        title="Perguntas Frequentes" 
        description="Saiba como usar a plataforma MotoControle e aproveitar todos os recursos"
      >
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <HelpCircle className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <h2 className="text-2xl font-bold">Como posso ajudar?</h2>
            <p className="text-gray-600">Confira as perguntas mais comuns sobre o MotoControle</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="getting-started">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Começando a Usar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Como começar?</h3>
                    <p className="text-gray-600">Após o login, você será direcionado para o Dashboard. Recomendamos que comece adicionando seus veículos e empresas para as quais você trabalha. Em seguida, você poderá começar a registrar seus rendimentos e despesas.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">O que é o Dashboard?</h3>
                    <p className="text-gray-600">O Dashboard é sua visão geral de dados, mostrando estatísticas importantes como faturamento, despesas, lucro e desempenho do veículo. É uma excelente maneira de visualizar seus dados de forma resumida.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="companies">
              <AccordionTrigger>
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Empresas e Rendimentos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Como adicionar uma empresa?</h3>
                    <p className="text-gray-600">Na página Empresas, clique no botão "Adicionar Empresa" e preencha os dados solicitados. Você pode adicionar o nome, descrição e até um código de referência para cada empresa.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Como registrar rendimentos?</h3>
                    <p className="text-gray-600">Na página Rendimentos, selecione a empresa, informe o período de trabalho, quilometragem e valor recebido. Os rendimentos são organizados por mês para facilitar o acompanhamento.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="expenses">
              <AccordionTrigger>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Despesas e Veículos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Como registrar despesas?</h3>
                    <p className="text-gray-600">Na página Despesas, você pode adicionar gastos informando a categoria, valor, data e descrição. As categorias padrão incluem Combustível, Manutenção, Seguro, entre outras.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Como adicionar um veículo?</h3>
                    <p className="text-gray-600">Na página Veículos, clique em "Adicionar Veículo" e preencha os dados como marca, modelo, ano, placa e quilometragem atual. Você pode cadastrar múltiplos veículos se necessário.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Como registrar abastecimentos?</h3>
                    <p className="text-gray-600">Na página Abastecimentos, você pode registrar quando abasteceu, quanto gastou e a quilometragem. Isso ajuda a calcular o consumo médio do veículo e o custo por km.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="reports">
              <AccordionTrigger>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Relatórios e Análises</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Como visualizar meu desempenho?</h3>
                    <p className="text-gray-600">No Dashboard, você tem acesso a gráficos e métricas que mostram seu desempenho financeiro e operacional. Use os filtros de período para analisar semana ou mês.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Posso exportar relatórios?</h3>
                    <p className="text-gray-600">Sim, usuários com assinatura Premium podem exportar relatórios em PDF. No Dashboard, use o botão "Exportar relatório" para gerar um documento com suas estatísticas principais.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="subscription">
              <AccordionTrigger>
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Assinatura e Planos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Quais planos estão disponíveis?</h3>
                    <p className="text-gray-600">Oferecemos um plano gratuito com recursos básicos, e planos Premium e Enterprise com funcionalidades avançadas como relatórios exportáveis, mais categorias de despesas e suporte prioritário.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Como assinar o plano Premium?</h3>
                    <p className="text-gray-600">Na página Assinatura, você pode visualizar e comparar os planos disponíveis. Clique em "Assinar" no plano desejado e siga as instruções para completar o pagamento.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Posso cancelar minha assinatura?</h3>
                    <p className="text-gray-600">Sim, você pode cancelar sua assinatura a qualquer momento. Na página Assinatura, clique em "Gerenciar Assinatura" e selecione a opção de cancelamento. Você continuará com acesso até o final do período pago.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="account">
              <AccordionTrigger>
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Conta e Suporte</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-7">
                  <div>
                    <h3 className="font-medium">Como atualizar meus dados de perfil?</h3>
                    <p className="text-gray-600">Na página Perfil, você pode editar suas informações pessoais e preferências de notificação. Mantenha seus dados atualizados para receber comunicações importantes.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Estou com problemas técnicos, como obter ajuda?</h3>
                    <p className="text-gray-600">Para suporte técnico, envie um e-mail para suporte@motocontrole.com.br com detalhes do problema que está enfrentando. Nossa equipe responderá em até 24 horas úteis.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Dicas para Maximizar seu Uso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Controle Diário</h3>
              <p className="text-gray-600">Para obter os melhores resultados, registre suas receitas e despesas diariamente. Isso evita esquecimentos e mantém seus dados precisos.</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Categorize Corretamente</h3>
              <p className="text-gray-600">Use as categorias de despesas adequadamente para ter uma visão clara de onde seu dinheiro está sendo gasto e identificar oportunidades de economia.</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Analise Tendências</h3>
              <p className="text-gray-600">Verifique regularmente os gráficos do Dashboard para identificar padrões e tendências que podem ajudar a otimizar suas operações.</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Backup de Dados</h3>
              <p className="text-gray-600">Assinantes Premium podem exportar relatórios regulares como forma de backup dos dados e para apresentação a contadores ou para fins fiscais.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold mb-4">Ainda precisa de ajuda?</h2>
        <p className="text-gray-600 mb-4">Nossa equipe está disponível para auxiliar em qualquer dúvida adicional.</p>
        <Button>
          <Link to="mailto:suporte@motocontrole.com.br">Entrar em Contato</Link>
        </Button>
      </div>
    </div>
  );
};

export default FAQ;
