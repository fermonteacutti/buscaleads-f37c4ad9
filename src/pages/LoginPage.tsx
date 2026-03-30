import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Radar, Mail, Lock, User, ArrowRight, Loader2, Wand2, RefreshCw, CreditCard } from "lucide-react";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("cadastro") === "true");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signUpConfirmation, setSignUpConfirmation] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !termsAccepted) {
      toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const cpfDigits = cpf.replace(/\D/g, "");
        if (cpfDigits.length !== 11) {
          toast.error("CPF inválido. Informe os 11 dígitos.");
          setLoading(false);
          return;
        }

        // Check if CPF already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("cpf", cpfDigits)
          .maybeSingle();

        if (existingProfile) {
          toast.error("Este CPF já possui uma conta cadastrada. Faça login ou recupere sua senha.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, cpf: cpfDigits },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;
        setSignUpEmail(email);
        setSignUpConfirmation(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");
        navigate("/app");
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        toast.error("✉️ E-mail não confirmado. Acesse sua caixa de entrada e clique no link que enviamos para ativar sua conta.");
      } else {
        toast.error(err.message || "Erro ao autenticar");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signUpEmail,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      if (error) throw error;
      toast.success("E-mail de confirmação reenviado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao reenviar e-mail");
    } finally {
      setResendLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar magic link");
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!termsAccepted) {
      toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://buscalead.ia.br/app" },
    });
    if (error) {
      toast.error(error.message || "Erro ao entrar com Google");
    }
  };

  // Tela de confirmação de cadastro
  if (signUpConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="p-8 rounded-2xl border border-border bg-card shadow-medium">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">✉️ Verifique seu e-mail!</h1>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-foreground">{signUpEmail}</span>.
              <br /><br />
              Clique no link para ativar sua conta e fazer login.
            </p>
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={handleResendConfirmation}
              disabled={resendLoading}
            >
              {resendLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Reenviar e-mail
            </Button>
            <button
              onClick={() => {
                setSignUpConfirmation(false);
                setIsSignUp(false);
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tela de confirmação após envio do magic link
  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="p-8 rounded-2xl border border-border bg-card shadow-medium">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Link enviado!</h1>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de acesso para <span className="font-medium text-foreground">{magicLinkEmail}</span>. Verifique seu e-mail e clique no link para entrar.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setMagicLinkSent(false); setShowMagicLink(false); }}>
              Voltar ao login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tela dedicada do Magic Link
  if (showMagicLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Radar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-foreground">Busca<span className="text-accent">Lead</span></span>
            </Link>
            <h1 className="text-2xl font-bold">Entrar com Magic Link</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sem senha! Enviaremos um link seguro para seu e-mail.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card shadow-medium">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
              <Wand2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Como funciona?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Digite seu e-mail abaixo</li>
                  <li>Receba um link seguro no e-mail</li>
                  <li>Clique no link e acesse direto o dashboard</li>
                </ol>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleMagicLink}>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Seu e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="email"
                    placeholder="seu@email.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  Concordo com os{" "}
                  <Link to="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</Link>
                  {" "}e a{" "}
                  <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              <Button variant="hero" className="w-full" type="submit" disabled={magicLinkLoading}>
                {magicLinkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Wand2 className="h-4 w-4 mr-1" />}
                Enviar Magic Link
              </Button>
            </form>

            <button
              onClick={() => setShowMagicLink(false)}
              className="w-full text-center mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao login com senha
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-4 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Radar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground">Busca<span className="text-accent">Lead</span></span>
          </Link>
          <h1 className="text-xl font-bold">{isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSignUp ? "Comece seus 7 dias gratuitos" : "Entre na sua conta"}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-medium">
          <div className="flex mb-4 bg-muted rounded-lg p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isSignUp ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isSignUp ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Cadastrar
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>

            {isSignUp && (
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <span>
                  Concordo com os{" "}
                  <Link to="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</Link>
                  {" "}e a{" "}
                  <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                </span>
              </label>
            )}

            <Button variant="hero" className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {isSignUp ? "Criar Conta Grátis" : "Entrar"} {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>

          {!isSignUp && (
            <ForgotPasswordDialog />
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">ou continue com</span></div>
          </div>

          {/* Terms checkbox for non-signup flows */}
          {!isSignUp && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer mb-3">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <span>
                Concordo com os{" "}
                <Link to="/termos-de-uso" className="text-primary hover:underline">Termos de Uso</Link>
                {" "}e a{" "}
                <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
              </span>
            </label>
          )}

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" onClick={() => setShowMagicLink(true)}>
              <Wand2 className="h-4 w-4 mr-2" />
              Entrar com Magic Link
            </Button>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
