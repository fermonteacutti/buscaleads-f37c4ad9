import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const planConfig: Record<string, { monthly: number; annual: number; credits: number; name: string }> = {
  starter: { monthly: 4900, annual: 41650, credits: 200, name: "Plano Starter" },
  pro: { monthly: 8900, annual: 75650, credits: 500, name: "Plano Pro" },
  business: { monthly: 12900, annual: 109650, credits: 1000, name: "Plano Business" },
  teste: { monthly: 100, annual: 100, credits: 1, name: "Plano Teste (R$1)" },
};

const creditPackConfig: Record<string, { price: number; credits: number; name: string }> = {
  pack_100: { price: 2900, credits: 100, name: "100 Créditos" },
  pack_300: { price: 5900, credits: 300, name: "300 Créditos" },
  pack_1000: { price: 14900, credits: 1000, name: "1.000 Créditos" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN_TEST")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { type, plan_id, billing } = await req.json();

    let title: string;
    let amountCents: number;
    let credits: number;

    if (type === "plan") {
      const plan = planConfig[plan_id];
      if (!plan) {
        return new Response(JSON.stringify({ error: "Plano inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      title = `${plan.name} (${billing === "annual" ? "Anual" : "Mensal"})`;
      amountCents = billing === "annual" ? plan.annual : plan.monthly;
      credits = plan.credits;
    } else if (type === "credits") {
      const pack = creditPackConfig[plan_id];
      if (!pack) {
        return new Response(JSON.stringify({ error: "Pacote inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      title = pack.name;
      amountCents = pack.price;
      credits = pack.credits;
    } else {
      return new Response(JSON.stringify({ error: "Tipo inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payment_intent record
    const { data: intent, error: intentError } = await supabase
      .from("payment_intents")
      .insert({
        user_id: userId,
        type,
        plan_id,
        billing: billing || null,
        amount: amountCents,
        credits,
        status: "pending",
      })
      .select("id")
      .single();

    if (intentError) {
      console.error("Intent insert error:", intentError);
      return new Response(JSON.stringify({ error: "Erro ao criar intent" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = req.headers.get("origin") || "https://buscalead.com";

    // Create Mercado Pago preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            unit_price: amountCents / 100,
            currency_id: "BRL",
          },
        ],
        payer: { email: userEmail },
        external_reference: intent.id,
        back_urls: {
          success: `${siteUrl}/app/pagamento/sucesso`,
          failure: `${siteUrl}/app/pagamento/erro`,
          pending: `${siteUrl}/app/pagamento/pendente`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      }),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error("MP error:", mpError);
      return new Response(JSON.stringify({ error: "Erro ao criar preferência MP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpData = await mpResponse.json();

    // Update intent with MP preference ID
    await supabase
      .from("payment_intents")
      .update({ mp_preference_id: mpData.id })
      .eq("id", intent.id);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preference_id: mpData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
