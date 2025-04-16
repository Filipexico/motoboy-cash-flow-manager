
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Update this to your domain in production
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
      throw new Error('Invalid request body: ' + e.message);
    }
    
    const { planType } = reqBody;
    if (!planType || (planType !== 'premium' && planType !== 'enterprise')) {
      throw new Error('Invalid plan type. Must be "premium" or "enterprise".');
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First create subscribers table if it doesn't exist
    await supabaseClient.rpc('create_subscribers_if_not_exists');
    logStep("Subscribers table created if it didn't exist");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY is not set, simulating subscription");
      
      // Simulate a subscription for testing
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
      
      logStep("Simulated subscription created", { userId: user.id, plan: planType });
      
      // Return a success response with simulated URL
      return new Response(JSON.stringify({ 
        url: `https://example.com/simulated-checkout?plan=${planType}`,
        simulated: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    try {
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

      const priceAmount = planType === 'premium' ? 1500 : 9900; // R$15 for premium, R$99 for enterprise
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
              unit_amount: priceAmount,
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
    logStep("Error in create-checkout", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
