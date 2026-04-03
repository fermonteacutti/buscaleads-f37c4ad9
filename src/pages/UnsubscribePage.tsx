import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const email = params.get("email");
  const isOk = status === "ok";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-medium">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: isOk ? "hsl(var(--success) / 0.12)" : "hsl(var(--destructive) / 0.12)" }}>
            {isOk ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              {isOk ? "Descadastro realizado" : "Ocorreu um erro"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isOk
                ? <>O e-mail <strong className="text-foreground">{email}</strong> foi removido da nossa lista. Você não receberá mais mensagens.</>
                : "Não foi possível processar o descadastro. Tente novamente ou entre em contato conosco."}
            </p>
          </div>

          <Button asChild variant="default">
            <a href="https://buscalead.ia.br">Voltar ao site</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
