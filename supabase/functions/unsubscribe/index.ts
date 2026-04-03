import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return new Response(htmlPage("Erro", "Link de descadastro inválido."), {
      status: 400,
      headers: HTML_HEADERS,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await admin
    .from("email_unsubscribes")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return new Response(htmlPage("Erro", "Ocorreu um erro. Tente novamente."), {
      status: 500,
      headers: HTML_HEADERS,
    });
  }

  return new Response(
    htmlPage(
      "Descadastro realizado",
      `O e-mail <strong>${email}</strong> foi removido da nossa lista. Você não receberá mais mensagens da Certifica SP.`
    ),
    { status: 200, headers: HTML_HEADERS }
  );
});

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — Certifica SP</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6f9; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 8px; padding: 40px; max-width: 480px; width: 90%; text-align: center; }
    .logo { background: #1e3a6e; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .logo img { height: 40px; }
    h1 { color: #1e3a6e; font-size: 20px; margin: 0 0 12px; }
    p { color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <img src="https://buscalead.ia.br/logo-certifica-negativa.png" alt="Certifica SP" />
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
