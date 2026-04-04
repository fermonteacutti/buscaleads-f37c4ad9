import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, company, subject, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Nome, e-mail e mensagem são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const subjectMap: Record<string, string> = {
      duvida: "Dúvida sobre a plataforma",
      planos: "Planos e preços",
      suporte: "Suporte técnico",
      enterprise: "Plano Enterprise",
      parceria: "Parceria",
      outro: "Outro",
    };

    const subjectLabel = subject ? subjectMap[subject] || subject : "Contato pelo site";

    const html = `
      <h2>Nova mensagem de contato — BuscaLead</h2>
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      ${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ""}
      <p><strong>Assunto:</strong> ${escapeHtml(subjectLabel)}</p>
      <hr />
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `BuscaLead Contato <noreply@buscalead.ia.br>`,
        to: ["contato@certificasp.com.br"],
        reply_to: email,
        subject: `[Contato] ${subjectLabel} — ${name}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar e-mail", details: err }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
