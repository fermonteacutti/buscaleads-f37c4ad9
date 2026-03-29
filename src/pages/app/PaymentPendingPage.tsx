import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PaymentPendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Clock className="h-16 w-16 text-warning mb-6" />
      <h1 className="text-2xl font-bold mb-2">Pagamento em análise</h1>
      <p className="text-muted-foreground mb-8">
        Você receberá um e-mail quando o pagamento for confirmado.
      </p>
      <Button asChild>
        <Link to="/app">Ir para o Dashboard</Link>
      </Button>
    </div>
  );
}
