import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Envia lead ao CRM do Evo AI
async function sendLeadToEvoAI(lead: {
  company_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  lead_id: string;
}) {
  const evoApiToken = Deno.env.get("EVOAI_API_TOKEN");
  const evoPipelineId = Deno.env.get("EVOAI_PIPELINE_ID");
  const evoStageId = "63ae1b04-44dc-4a31-a8b7-676f86c399fc";
  
  if (!evoApiToken || !evoPipelineId) {
    console.warn("Evo AI env vars not configured — skipping CRM sync");
    return null;
  }

  try {
    const phone = lead.phone?.replace(/\D/g, "") || null;
    const phoneE164 = phone && phone.length >= 10
      ? phone.startsWith("55") ? phone : `55${phone}`
      : null;

    const payload = {
      contact: {
        name: lead.company_name || "Lead sem nome",
        phone: phoneE164,
        email: lead.email || `lead-${lead.lead_id}@sem-email.interno`,
      },
      deal: {
        pipeline_id: evoPipelineId,
        stage_id: evoStageId,
        name: lead.company_name || "Lead sem nome",
      },
      custom_fields: {
        source: "BuscaLead",
        cidade: lead.city || "",
        estado: lead.state || "",
        lead_id: lead.lead_id,
      },
    };

    const response = await fetch("https://api.evoai.app/public/api/v1/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": evoApiToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Evo AI lead creation failed:", err);
      return null;
    }

    return await response.json();
  } catch (e) {
    console.error("Evo AI sync error:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getUser();
    if (claimsError || !claimsData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.user.id;

    const { search_id, max_leads } = await req.json();
    if (!search_id) {
      return new Response(JSON.stringify({ error: "search_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const desiredLeads = Math.min(Math.max(max_leads || 20, 1), 200);

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: search, error: searchError } = await admin
      .from("searches")
      .select("*")
      .eq("id", search_id)
      .eq("user_id", userId)
      .single();

    if (searchError || !search) {
      return new Response(
        JSON.stringify({ error: "Search not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: balanceData, error: balanceError } = await admin
      .from("credit_balances")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (balanceError || !balanceData) {
      await admin.from("searches").update({ status: "failed", error_message: "Erro ao verificar créditos" }).eq("id", search_id);
      return new Response(JSON.stringify({ error: "Erro ao verificar créditos" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (balanceData.balance < 1) {
      await admin.from("searches").update({ status: "failed", error_message: "Créditos insuficientes" }).eq("id", search_id);
      return new Response(JSON.stringify({ error: "Créditos insuficientes", code: "INSUFFICIENT_CREDITS" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const effectiveDesiredLeads = Math.min(desiredLeads, balanceData.balance);

    await admin
      .from("searches")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", search_id);

    let query = search.business_type;
    if (!search.nationwide) {
      if (search.location_city) query += ` em ${search.location_city}`;
      if (search.location_state) query += `, ${search.location_state}`;
    } else {
      query += " no Brasil";
    }

    const allPlaces: any[] = [];
    let nextPageToken: string | null = null;
    const maxPages = Math.ceil(effectiveDesiredLeads / 20);

    for (let page = 0; page < maxPages; page++) {
      let placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${googleApiKey}`;
      if (nextPageToken) {
        placesUrl += `&pagetoken=${nextPageToken}`;
      }

      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();

      if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
        if (page === 0) {
          console.error("Google Places API error:", placesData);
          await admin.from("searches").update({ status: "failed", error_message: `Google API: ${placesData.status}` }).eq("id", search_id);
          return new Response(
            JSON.stringify({ error: "Google Places API error", status: placesData.status }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
      }

      allPlaces.push(...(placesData.results || []));
      if (allPlaces.length >= effectiveDesiredLeads || !placesData.next_page_token) break;
      nextPageToken = placesData.next_page_token;
      await new Promise((r) => setTimeout(r, 2000));
    }

    const places = allPlaces.slice(0, effectiveDesiredLeads);

    const leads = [];
    for (const place of places) {
      let phone = null;
      let website = null;

      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website&language=pt-BR&key=${googleApiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        if (detailsData.result) {
          phone = detailsData.result.formatted_phone_number || null;
          website = detailsData.result.website || null;
        }
      } catch (e) {
        console.error("Error fetching place details:", e);
      }

      const addressParts = (place.formatted_address || "").split(",").map((s: string) => s.trim());

      // Extrai cidade e estado corretamente do formato: "Rua X - Bairro, Cidade - UF, CEP, Brasil"
      let city: string | null = null;
      let state: string | null = null;
      const cityStateRaw = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null;
      if (cityStateRaw) {
        const match = cityStateRaw.match(/^(.+?)\s*-\s*([A-Z]{2})$/);
        if (match) {
          city = match[1].trim();
          state = match[2].trim();
        } else {
          city = cityStateRaw;
        }
      }

      leads.push({
        user_id: userId,
        search_id: search_id,
        google_place_id: place.place_id || null,
        company_name: place.name || null,
        address: place.formatted_address || null,
        city,
        state,
        phone,
        website,
        source: "google_maps",
        segment: search.business_type,
        raw_data: place,
        funnel_status: "new",
      });
    }

    // PASSO 4: Inserir leads
    let leadsInserted = 0;
    let insertedLeadRows: any[] = [];

    if (leads.length > 0) {
      const { data: insertedLeads, error: insertError } = await admin
        .from("leads")
        .upsert(leads, { onConflict: "user_id,google_place_id", ignoreDuplicates: true })
        .select("id, company_name, phone, email, city, state");

      if (insertError) {
        console.error("Error inserting leads:", insertError);
        await admin.from("searches").update({ status: "failed", error_message: "Erro ao salvar leads" }).eq("id", search_id);
        return new Response(JSON.stringify({ error: "Erro ao salvar leads" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      insertedLeadRows = insertedLeads || [];
      leadsInserted = insertedLeadRows.length;
    }

    // PASSO 4.5: Enviar leads novos ao Evo AI CRM (fire-and-forget)
    if (insertedLeadRows.length > 0) {
      Promise.allSettled(
        insertedLeadRows.map((lead) =>
          sendLeadToEvoAI({
            company_name: lead.company_name,
            phone: lead.phone,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            lead_id: lead.id,
          })
        )
      ).then((results) => {
        const synced = results.filter((r) => r.status === "fulfilled" && r.value).length;
        console.log(`Evo AI CRM sync: ${synced}/${insertedLeadRows.length} leads enviados`);
      });
    }

    // PASSO 5: Debitar créditos
    if (leadsInserted > 0) {
      const { data: debitResult } = await admin.rpc("debit_credits", {
        p_user_id: userId,
        p_amount: leadsInserted,
        p_description: `Busca: ${search.business_type} em ${search.location_city || "Brasil"} (${leadsInserted} leads)`,
        p_reference_id: search_id,
      });

      console.log("Debit result:", debitResult);
    }

    // PASSO 6: Atualizar search como completed
    await admin
      .from("searches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        leads_found: leadsInserted,
        credits_used: leadsInserted,
      })
      .eq("id", search_id);

    return new Response(
      JSON.stringify({
        success: true,
        leads_found: leadsInserted,
        duplicates_skipped: leads.length - leadsInserted,
        credits_used: leadsInserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
