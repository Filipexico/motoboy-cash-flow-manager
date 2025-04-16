
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
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Function started");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    logStep("Supabase client created");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
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
      logStep("STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ 
        error: "Stripe key not configured",
        simulated: true,
        url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription`
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
        return new Response(JSON.stringify({ 
          error: "Invalid Stripe API key",
          simulated: true,
          url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        logStep("No Stripe customer found for this user");
        throw new Error("No Stripe customer found for this user");
      }
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      const origin = req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app";
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/subscription`,
      });
      logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("Stripe error", { error: stripeError.message });
      return new Response(JSON.stringify({ 
        error: stripeError.message,
        simulated: true,
        url: `${req.headers.get("origin") || "https://motoboy-cash-flow-manager.lovable.app"}/subscription`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
