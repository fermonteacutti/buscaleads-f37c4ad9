import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CheckCircle2 className="h-16 w-16 text-success mb-6" />
      <h1 className="text-2xl font-bold mb-2">Pagamento aprovado!</h1>
      <p className="text-muted-foreground mb-8">
        Seus créditos foram adicionados à sua conta.
      </p>
      <Button asChild>
        <Link to="/app">Ir para o Dashboard</Link>
      </Button>
    </div>
  );
}
