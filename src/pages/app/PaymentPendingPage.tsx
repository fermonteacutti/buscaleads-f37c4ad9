import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export default function PaymentPendingPage() {
  const navigate = useNavigate();
  const { balance, fetchBalance } = useCredits();
  const initialBalance = useRef<number | null>(null);

  useEffect(() => {
    if (initialBalance.current === null) {
      initialBalance.current = balance;
    }
  }, [balance]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBalance]);

  useEffect(() => {
    if (initialBalance.current !== null && balance > initialBalance.current) {
      navigate("/app/pagamento/sucesso");
    }
  }, [balance, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Clock className="h-16 w-16 text-warning mb-6" />
      <h1 className="text-2xl font-bold mb-2">Pagamento em análise</h1>
      <p className="text-muted-foreground mb-4">
        Você receberá um e-mail quando o pagamento for confirmado.
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando pagamento...
      </div>
      <Button asChild>
        <Link to="/app">Ir para o Dashboard</Link>
      </Button>
    </div>
  );
}
