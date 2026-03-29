import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export default function PaymentSuccessPage() {
  const { fetchBalance } = useCredits();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Refresh credits on mount — webhook may have already processed
    const check = async () => {
      await fetchBalance();
      setConfirmed(true);
    };
    check();
  }, [fetchBalance]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {confirmed ? (
        <>
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Pagamento aprovado!</h1>
          <p className="text-muted-foreground mb-8">
            Seus créditos foram adicionados à sua conta.
          </p>
        </>
      ) : (
        <>
          <Loader2 className="h-16 w-16 text-primary mb-6 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Confirmando pagamento...</h1>
          <p className="text-muted-foreground mb-8">
            Aguarde enquanto verificamos seu pagamento.
          </p>
        </>
      )}
      <Button asChild>
        <Link to="/app">Ir para o Dashboard</Link>
      </Button>
    </div>
  );
}
