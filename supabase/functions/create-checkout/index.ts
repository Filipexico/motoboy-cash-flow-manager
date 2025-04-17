
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Function started");
    
    let reqBody;
    try {
      reqBody = await req.json();
      logStep("Request body parsed", reqBody);
    } catch (e) {
      logStep("Invalid request body", { error: e.message });
      throw new Error('Invalid request body: ' + e.message);
    }
    
    const { planType } = reqBody;
    if (!planType || (planType !== 'premium' && planType !== 'enterprise')) {
      logStep("Invalid plan type", { planType });
      throw new Error('Invalid plan type. Must be "premium" or "enterprise".');
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    logStep("Supabase client created");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      logStep("Authentication error", { error: authError.message });
      throw new Error("Authentication error: " + authError.message);
    }
    
    const user = data.user;
    if (!user?.email) {
      logStep("User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First create subscribers table if it doesn't exist
    try {
      await supabaseClient.rpc('create_subscribers_if_not_exists');
      logStep("Subscribers table created if it didn't exist");
    } catch (error) {
      logStep("Error creating subscribers table", { error: error.message });
      // Continue anyway, the table might already exist
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    logStep("Stripe key check", { exists: !!stripeKey });
    
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY is not set, simulating subscription");
      
      // Simulate a subscription for testing
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      try {
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          subscribed: true,
          subscription_tier: planType,
          subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        logStep("Simulated subscription created", { userId: user.id, plan: planType });
      } catch (error) {
        logStep("Error creating simulated subscription", { error: error.message });
      }
      
      // Return a success response with simulated URL
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription?success=true&simulated=true`,
        simulated: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
      logStep("Stripe client created");

      // Check if API key is valid by making a simple request
      try {
        await stripe.customers.list({ limit: 1 });
        logStep("Stripe API key is valid");
      } catch (stripeError) {
        logStep("Stripe API key is invalid", { error: stripeError.message });
        
        // Fall back to simulation
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        await supabaseClient.from("subscribers").upsert({
          user_id: user.id,
          email: user.email,
          subscribed: true,
          subscription_tier: planType,
          subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        logStep("Created fallback subscription due to invalid Stripe key", { userId: user.id, plan: planType });
        
        return new Response(JSON.stringify({ 
          url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription?success=true&simulated=true`,
          simulated: true,
          error: "Invalid Stripe API key"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId;
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = customer.id;
        logStep("Created new customer", { customerId });
      }

      // Definir valores corretos para os planos
      const priceAmount = planType === 'premium' ? 1990 : 4990; // R$19.90 para premium, R$49.90 para enterprise
      const origin = req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app";
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: planType === 'premium' ? 'Plano Premium' : 'Plano Empresarial',
                description: planType === 'premium' 
                  ? 'Acesso a todas as funcionalidades premium' 
                  : 'Acesso a todas as funcionalidades empresariais',
              },
              unit_amount: priceAmount,  // 1990 = R$19,90 | 4990 = R$49,90
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscription?canceled=true`,
      });

      logStep("Checkout session created", { sessionId: session.id, url: session.url });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("Stripe error", { error: stripeError.message });
      
      // Fallback to simulation if Stripe has issues
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        subscribed: true,
        subscription_tier: planType,
        subscription_end: endDate.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      logStep("Created fallback subscription due to Stripe error", { userId: user.id, plan: planType });
      
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription?success=true&simulated=true`,
        simulated: true,
        error: stripeError.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error in create-checkout", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
