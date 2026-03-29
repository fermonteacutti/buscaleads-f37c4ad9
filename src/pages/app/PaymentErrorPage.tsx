import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <XCircle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-2xl font-bold mb-2">Pagamento não realizado</h1>
      <p className="text-muted-foreground mb-8">
        Ocorreu um problema com o pagamento. Tente novamente.
      </p>
      <Button variant="outline" asChild>
        <Link to="/planos">Voltar aos Planos</Link>
      </Button>
    </div>
  );
}
