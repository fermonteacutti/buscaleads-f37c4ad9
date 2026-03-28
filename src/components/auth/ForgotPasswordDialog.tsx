import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail de recuperação");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSent(false);
      setEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <p className="text-center mt-4">
          <button type="button" className="text-xs text-primary hover:underline">
            Esqueci minha senha
          </button>
        </p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle>E-mail enviado!</DialogTitle>
              <DialogDescription className="text-center mt-2">
                Enviamos um link de recuperação para{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" className="w-full mt-6" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Recuperar senha</DialogTitle>
              <DialogDescription>
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Enviar link de recuperação
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
