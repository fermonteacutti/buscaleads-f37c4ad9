import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    // Verify user
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

    // Parse body
    const { search_id } = await req.json();
    if (!search_id) {
      return new Response(JSON.stringify({ error: "search_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for DB operations
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Get search details
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

    // Update search status to running
    await admin
      .from("searches")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", search_id);

    // Debit credits
    const { data: debitResult } = await admin.rpc("debit_credits", {
      p_user_id: userId,
      p_amount: search.credits_estimated,
      p_description: `Busca: ${search.business_type}`,
      p_reference_id: search_id,
    });

    if (debitResult && !(debitResult as any).success) {
      await admin
        .from("searches")
        .update({ status: "failed", error_message: "Créditos insuficientes" })
        .eq("id", search_id);

      return new Response(
        JSON.stringify({ error: "Créditos insuficientes", details: debitResult }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Google Places Text Search query
    let query = search.business_type;
    if (!search.nationwide) {
      if (search.location_city) query += ` em ${search.location_city}`;
      if (search.location_state) query += `, ${search.location_state}`;
    } else {
      query += " no Brasil";
    }

    // Call Google Places API (Text Search)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${googleApiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== "OK" && placesData.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", placesData);
      await admin
        .from("searches")
        .update({ status: "failed", error_message: `Google API: ${placesData.status}` })
        .eq("id", search_id);

      return new Response(
        JSON.stringify({ error: "Google Places API error", status: placesData.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const places = placesData.results || [];
    const leads = [];

    // For each place, optionally get details (phone, website)
    for (const place of places.slice(0, 20)) {
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

      // Parse address components
      const addressParts = (place.formatted_address || "").split(",").map((s: string) => s.trim());

      leads.push({
        user_id: userId,
        search_id: search_id,
        company_name: place.name || null,
        address: place.formatted_address || null,
        city: addressParts.length >= 3 ? addressParts[addressParts.length - 3] : null,
        state: addressParts.length >= 2 ? addressParts[addressParts.length - 2] : null,
        phone,
        website,
        source: "google_maps",
        segment: search.business_type,
        raw_data: place,
        funnel_status: "new",
      });
    }

    // Insert leads
    let leadsInserted = 0;
    if (leads.length > 0) {
      const { data: insertedLeads, error: insertError } = await admin
        .from("leads")
        .insert(leads)
        .select("id");

      if (insertError) {
        console.error("Error inserting leads:", insertError);
      } else {
        leadsInserted = insertedLeads?.length || 0;
      }
    }

    // Update search as completed
    await admin
      .from("searches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        leads_found: leadsInserted,
        credits_used: search.credits_estimated,
      })
      .eq("id", search_id);

    return new Response(
      JSON.stringify({ success: true, leads_found: leadsInserted }),
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
