import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Parceria Certifica SP</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:24px 0;">
  <tr><td align="center">
  <table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
    <tr><td style="background-color:#1e3a6e;padding:28px 40px;text-align:center;">
      <img src="https://buscalead.ia.br/logo-certifica-negativa.png" alt="Certifica SP" width="220" style="display:inline-block;" />
    </td></tr>
    <tr><td style="background-color:#f0f4fa;padding:28px 40px 20px;border-bottom:3px solid #2d7a4f;">
      <p style="margin:0 0 8px 0;font-size:11px;color:#1e3a6e;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Proposta de Parceria</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#1e3a6e;font-weight:700;line-height:1.25;">Certificados Digitais para<br/>o seu Escritório Contábil</h1>
      <p style="margin:14px 0 0 0;font-size:14px;color:#4a5568;line-height:1.6;">Ofereça mais valor aos seus clientes com emissão ágil de certificados digitais — e ainda aumente a receita do seu escritório com uma das melhores remunerações do mercado.</p>
    </td></tr>
    <tr><td style="background-color:#1e3a6e;padding:18px 40px;text-align:center;">
      <p style="margin:0;font-size:15px;color:#ffffff;font-weight:700;">💰 Uma das melhores remunerações para escritórios contábeis do Brasil</p>
      <p style="margin:6px 0 0 0;font-size:12px;color:#a0b4d0;">Ganhe por cada certificado emitido para os seus clientes, sem custo de adesão.</p>
    </td></tr>
    <tr><td style="padding:28px 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:33%;padding-right:8px;vertical-align:top;">
            <div style="background-color:#f0f4fa;border-radius:8px;padding:18px 14px;border-top:3px solid #1e3a6e;">
              <p style="margin:0 0 8px 0;font-size:20px;">💰</p>
              <p style="margin:0 0 5px 0;font-size:12px;font-weight:700;color:#1e3a6e;">Remuneração Atrativa</p>
              <p style="margin:0;font-size:11px;color:#4a5568;line-height:1.5;">Comissão competitiva por certificado emitido, sem taxa de adesão nem mensalidade.</p>
            </div>
          </td>
          <td style="width:33%;padding:0 4px;vertical-align:top;">
            <div style="background-color:#f0f4fa;border-radius:8px;padding:18px 14px;border-top:3px solid #2d7a4f;">
              <p style="margin:0 0 8px 0;font-size:20px;">🔐</p>
              <p style="margin:0 0 5px 0;font-size:12px;font-weight:700;color:#1e3a6e;">Emissão Ágil</p>
              <p style="margin:0;font-size:11px;color:#4a5568;line-height:1.5;">Processo 100% digital ou presencial em minutos, sem burocracia para você ou seu cliente.</p>
            </div>
          </td>
          <td style="width:33%;padding-left:8px;vertical-align:top;">
            <div style="background-color:#f0f4fa;border-radius:8px;padding:18px 14px;border-top:3px solid #1e3a6e;">
              <p style="margin:0 0 8px 0;font-size:20px;">🤝</p>
              <p style="margin:0 0 5px 0;font-size:12px;font-weight:700;color:#1e3a6e;">Suporte Dedicado</p>
              <p style="margin:0;font-size:11px;color:#4a5568;line-height:1.5;">Time especializado para atender você e seus clientes com agilidade e segurança.</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:4px 40px 28px;">
      <p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:#1e3a6e;text-transform:uppercase;letter-spacing:1px;">Certificados disponíveis</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background-color:#1e3a6e;">
            <th style="padding:10px 14px;text-align:left;font-weight:600;color:#ffffff;">Produto</th>
            <th style="padding:10px 14px;text-align:center;font-weight:600;color:#ffffff;">Tipo</th>
            <th style="padding:10px 14px;text-align:center;font-weight:600;color:#ffffff;">Validade</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color:#ffffff;">
            <td style="padding:10px 14px;color:#1e3a6e;font-weight:600;border-bottom:1px solid #e2e8f0;">e-CPF</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;border-bottom:1px solid #e2e8f0;">A1 (arquivo) / A3 (token)</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;border-bottom:1px solid #e2e8f0;">1, 2 ou 3 anos</td>
          </tr>
          <tr style="background-color:#f8fafc;">
            <td style="padding:10px 14px;color:#1e3a6e;font-weight:600;border-bottom:1px solid #e2e8f0;">e-CNPJ</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;border-bottom:1px solid #e2e8f0;">A1 (arquivo) / A3 (token)</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;border-bottom:1px solid #e2e8f0;">1, 2 ou 3 anos</td>
          </tr>
          <tr style="background-color:#ffffff;">
            <td style="padding:10px 14px;color:#1e3a6e;font-weight:600;">NF-e / NFS-e</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;">A1 (arquivo)</td>
            <td style="padding:10px 14px;text-align:center;color:#4a5568;">1 ano</td>
          </tr>
        </tbody>
      </table>
    </td></tr>
    <tr><td style="padding:0 40px 36px;text-align:center;">
      <p style="margin:0 0 20px 0;font-size:14px;color:#4a5568;line-height:1.6;">Quer saber mais sobre a parceria e a remuneração?<br/>Fale agora com um de nossos consultores pelo WhatsApp.</p>
      <a href="https://wa.me/5519997260329?text=Ol%C3%A1%2C%20recebi%20um%20e-mail%20da%20Certifica%20SP%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20parceria." style="display:inline-block;background-color:#25d366;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;">💬 Falar no WhatsApp</a>
    </td></tr>
    <tr><td style="background-color:#1e3a6e;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 6px 0;font-size:12px;color:#a0b4d0;">Certifica SP — Autoridade Registradora credenciada ICP-Brasil</p>
      <p style="margin:0;font-size:11px;color:#6b84a0;">Você recebeu este e-mail pois seu escritório foi identificado como potencial parceiro.</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>
`;

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

    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const { lead_id, to_email, to_name } = await req.json();

    if (!lead_id || !to_email) {
      return new Response(JSON.stringify({ error: "lead_id e to_email são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Envia e-mail via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Certifica SP <noreply@buscalead.ia.br>",
        to: [to_email],
        subject: "Parceria em Certificado Digital — Proposta para o seu Escritório",
        html: EMAIL_HTML,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Falha ao enviar e-mail", details: err }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendData = await resendResponse.json();

    // Atualiza funnel_status do lead para "contacted"
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    await admin
      .from("leads")
      .update({ funnel_status: "contacted" })
      .eq("id", lead_id);

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
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
