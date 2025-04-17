
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Atualizar para o domínio em produção
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Função iniciada");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Cliente Supabase criado");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Cabeçalho de autorização não fornecido");
      throw new Error("Cabeçalho de autorização não fornecido");
    }
    logStep("Cabeçalho de autorização encontrado");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Erro de autenticação", { error: userError.message });
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("Usuário não autenticado ou email não disponível");
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    // Primeiro criar tabela de assinantes se não existir
    try {
      await supabaseClient.rpc('create_subscribers_if_not_exists');
      logStep("Tabela de assinantes existente verificada");
    } catch (error) {
      logStep("Erro ao verificar tabela de assinantes", { error });
      // Continuar mesmo assim, a tabela já pode existir
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    logStep("Verificação da chave Stripe", { exists: !!stripeKey });
    
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY não está definida, retornando estado não assinado");
      // Criar um registro para este usuário para evitar erros futuros
      try {
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        logStep("Registro não assinante criado devido à falta da chave Stripe");
      } catch (error) {
        logStep("Erro ao criar registro não assinante", { error });
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        error: "Chave Stripe não configurada" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Blocos try-catch para cada operação Stripe para fornecer melhor tratamento de erros
    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      logStep("Cliente Stripe criado");

      // Verificar se a chave API é válida fazendo uma solicitação simples
      try {
        await stripe.customers.list({ limit: 1 });
        logStep("Chave API do Stripe é válida");
      } catch (stripeError) {
        logStep("Chave API do Stripe é inválida", { error: stripeError.message });
        
        // Fallback para verificação no banco de dados
        const { data } = await supabaseClient
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          return new Response(JSON.stringify({
            subscribed: data.subscribed || false,
            subscription_tier: data.subscription_tier || null,
            subscription_end: data.subscription_end || null,
            error: "Usando dados de fallback devido a erro na API do Stripe"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        return new Response(JSON.stringify({ 
          subscribed: false, 
          error: "Chave API do Stripe inválida" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("Nenhum cliente encontrado, atualizando estado não assinado");
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
        return new Response(JSON.stringify({ subscribed: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = customers.data[0].id;
      logStep("Cliente Stripe encontrado", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      const hasActiveSub = subscriptions.data.length > 0;
      let subscriptionTier = null;
      let subscriptionEnd = null;

      if (hasActiveSub) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Assinatura ativa encontrada", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Determinar nível de assinatura a partir do preço
        try {
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId);
          const amount = price.unit_amount || 0;
          
          if (amount <= 1990) {
            subscriptionTier = "premium";
          } else {
            subscriptionTier = "enterprise";
          }
          
          logStep("Nível de assinatura determinado", { priceId, amount, subscriptionTier });
        } catch (priceError) {
          logStep("Erro ao determinar nível de preço", { error: priceError.message });
          // Padrão para premium se não pudermos determinar o nível
          subscriptionTier = "premium";
        }
      } else {
        logStep("Nenhuma assinatura ativa encontrada");
      }

      // Atualizar banco de dados com informações de assinatura
      const updateResult = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (updateResult.error) {
        logStep("Erro ao atualizar assinatura no banco de dados", { error: updateResult.error });
      } else {
        logStep("Banco de dados atualizado com informações de assinatura", { subscribed: hasActiveSub, subscriptionTier });
      }

      return new Response(JSON.stringify({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("Erro na API do Stripe", { error: stripeError.message });
      
      // Fallback para verificação no banco de dados
      const { data } = await supabaseClient
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        return new Response(JSON.stringify({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
          error: "Usando dados de fallback devido a erro na API do Stripe"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Retornar um padrão seguro se nenhum dado for encontrado
      return new Response(JSON.stringify({ 
        subscribed: false,
        error: "Erro na API do Stripe"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
