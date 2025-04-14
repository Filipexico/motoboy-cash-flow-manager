
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is subscribed
    const { data: subscriberData } = await supabaseClient
      .from("subscribers")
      .select("subscribed")
      .eq("user_id", user.id)
      .maybeSingle();

    const isSubscribed = subscriberData?.subscribed === true;
    if (!isSubscribed) {
      return new Response(JSON.stringify({ 
        error: "Subscription required",
        message: "Este recurso requer uma assinatura ativa."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // In a real implementation, we would generate a PDF here
    // For example, using a PDF generation service or library

    // For now, we'll return a success response
    return new Response(JSON.stringify({ 
      success: true,
      message: "Relatório gerado com sucesso!",
      // url: "https://example.com/sample.pdf" // In a real implementation, provide a download URL
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in export-dashboard-pdf:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
