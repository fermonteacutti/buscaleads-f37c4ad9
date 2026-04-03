import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return Response.redirect("https://buscalead.ia.br/descadastro?status=erro", 302);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await admin
    .from("email_unsubscribes")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return Response.redirect("https://buscalead.ia.br/descadastro?status=erro", 302);
  }

  return Response.redirect(
    `https://buscalead.ia.br/descadastro?status=ok&email=${encodeURIComponent(email)}`,
    302
  );
});
