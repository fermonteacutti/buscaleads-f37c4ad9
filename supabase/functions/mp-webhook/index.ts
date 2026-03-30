import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Mercado Pago sends different notification types
    // We only care about payment notifications
    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      console.log("Ignoring non-payment notification:", body.type, body.action);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error("No payment ID in webhook body");
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });

    if (!mpResponse.ok) {
      // Try test token as fallback
      const mpTestToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN_TEST");
      if (mpTestToken) {
        const mpTestResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${mpTestToken}` },
        });
        if (!mpTestResponse.ok) {
          const errText = await mpTestResponse.text();
          console.error("MP API error (both tokens):", errText);
          return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const paymentData = await mpTestResponse.json();
        return await processPayment(paymentData, paymentId);
      }
      const errText = await mpResponse.text();
      console.error("MP API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentData = await mpResponse.json();
    return await processPayment(paymentData, paymentId);
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processPayment(paymentData: any, paymentId: string) {
  console.log("Payment status:", paymentData.status, "external_reference:", paymentData.external_reference);

  if (paymentData.status !== "approved") {
    console.log("Payment not approved, status:", paymentData.status);
    return new Response(JSON.stringify({ ok: true, status: paymentData.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const intentId = paymentData.external_reference;
  if (!intentId) {
    console.error("No external_reference in payment");
    return new Response(JSON.stringify({ error: "No external_reference" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get the payment intent
  const { data: intent, error: intentError } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", intentId)
    .single();

  if (intentError || !intent) {
    console.error("Intent not found:", intentId, intentError);
    return new Response(JSON.stringify({ error: "Intent not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check if already processed
  if (intent.status === "approved") {
    console.log("Intent already processed:", intentId);
    return new Response(JSON.stringify({ ok: true, already_processed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update intent status
  await supabase
    .from("payment_intents")
    .update({
      status: "approved",
      mp_payment_id: String(paymentId),
      processed_at: new Date().toISOString(),
    })
    .eq("id", intentId);

  // Add credits to user
  const { error: creditError } = await supabase.rpc("add_credits", {
    p_user_id: intent.user_id,
    p_amount: intent.credits,
    p_description: intent.type === "plan"
      ? `Assinatura: ${intent.plan_id}`
      : `Pacote de ${intent.credits} créditos`,
    p_reference_id: intentId,
  });

  if (creditError) {
    console.error("Error adding credits:", creditError);
    return new Response(JSON.stringify({ error: "Failed to add credits" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`Added ${intent.credits} credits to user ${intent.user_id}`);

  // If it's a plan purchase, update the subscription
  if (intent.type === "plan") {
    const planSlug = intent.plan_id; // e.g. "starter", "pro", "business"
    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", planSlug)
      .single();

    if (plan) {
      const billingCycle = intent.billing || "monthly";
      const periodDays = billingCycle === "annual" ? 365 : 30;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

      // Update existing subscription (unique constraint on user_id)
      await supabase
        .from("subscriptions")
        .update({
          plan_id: plan.id,
          status: "active",
          billing_cycle: billingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          canceled_at: null,
          updated_at: now.toISOString(),
        })
        .eq("user_id", intent.user_id);

      console.log(`Updated subscription to ${planSlug} for user ${intent.user_id}`);
    } else {
      console.error(`Plan not found for slug: ${planSlug}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, credits_added: intent.credits }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
