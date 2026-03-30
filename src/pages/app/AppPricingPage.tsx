import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type BillingTab = "monthly" | "annual" | "oneoff";

const subscriptionPlans = [
  {
    name: "Starter",
    slug: "starter",
    monthlyPrice: 49,
    annualPrice: 41.65,
    credits: "200 créditos/mês",
    popular: false,
    cta: "Assinar Starter",
    features: [
      { label: "200 créditos/mês", included: true },
      { label: "1 busca simultânea", included: true },
      { label: "Exportação CSV", included: true },
      { label: "Google Maps", included: true },
      { label: "Até 500 leads salvos", included: true },
      { label: "Suporte e-mail (72h)", included: true },
      { label: "Todas as fontes", included: false },
      { label: "Funil completo", included: false },
      { label: "API Access", included: false },
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    monthlyPrice: 89,
    annualPrice: 75.65,
    credits: "500 créditos/mês",
    popular: true,
    cta: "Assinar Pro",
    features: [
      { label: "500 créditos/mês", included: true },
      { label: "3 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes de dados", included: true },
      { label: "Leads salvos ilimitados", included: true },
      { label: "Funil completo", included: true },
      { label: "Suporte prioritário (24h)", included: true },
      { label: "Integração CRM (em breve)", included: true },
      { label: "API Access", included: false },
    ],
  },
  {
    name: "Business",
    slug: "business",
    monthlyPrice: 129,
    annualPrice: 109.65,
    credits: "1.000 créditos/mês",
    popular: false,
    cta: "Assinar Business",
    features: [
      { label: "1.000 créditos/mês", included: true },
      { label: "10 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes de dados", included: true },
      { label: "Leads salvos ilimitados", included: true },
      { label: "Funil completo", included: true },
      { label: "Suporte prioritário (4h)", included: true },
      { label: "API Access", included: true },
      { label: "Integração CRM (em breve)", included: true },
    ],
  },
];

const enterpriseFeatures = [
  "Créditos customizados",
  "Usuários ilimitados",
  "SLA dedicado",
  "CRM incluso",
  "Gerente de conta",
  "Onboarding personalizado",
  "API Access",
  "Todas as fontes de dados",
];

const creditPacks = [
  { id: "pack_100", amount: 100, price: 29, perCredit: "0,29" },
  { id: "pack_300", amount: 300, price: 59, perCredit: "0,20", popular: true },
  { id: "pack_1000", amount: 1000, price: 149, perCredit: "0,15" },
];

export default function AppPricingPage() {
  const [tab, setTab] = useState<BillingTab>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutDialog, setCheckoutDialog] = useState<{ open: boolean; url: string | null }>({
    open: false,
    url: null,
  });
  const { isAdmin } = useIsAdmin();

  const allPlans = subscriptionPlans;

  const tabs: { value: BillingTab; label: string; extra?: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "annual", label: "Anual", extra: "-15%" },
    { value: "oneoff", label: "Avulso" },
  ];

  const handleCheckoutReady = (initPoint: string) => {
    setCheckoutDialog({ open: true, url: initPoint });
  };

  const handleGoToCheckout = () => {
    if (checkoutDialog.url) {
      window.location.href = checkoutDialog.url;
    }
  };

  const handleSubscribe = async (planSlug: string, billing: "monthly" | "annual") => {
    const key = `${planSlug}_${billing}`;
    setLoadingPlan(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { type: "plan", plan_id: planSlug, billing },
      });
      if (error) throw error;
      if (data?.init_point) {
        handleCheckoutReady(data.init_point);
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleBuyCredits = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { type: "credits", plan_id: planId },
      });
      if (error) throw error;
      if (data?.init_point) {
        handleCheckoutReady(data.init_point);
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8 relative">
      {/* Checkout instruction dialog */}
      <Dialog open={checkoutDialog.open} onOpenChange={(open) => !open && setCheckoutDialog({ open: false, url: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Antes de continuar...</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2 space-y-3">
              <p>
                Você será direcionado ao <strong>checkout do Mercado Pago</strong> para finalizar o pagamento.
              </p>
              <p>
                Após concluir o pagamento, clique no botão{" "}
                <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-medium text-foreground">
                  ← Voltar à loja
                </span>{" "}
                na parte inferior da página do Mercado Pago para retornar e confirmar seus créditos.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setCheckoutDialog({ open: false, url: null })}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGoToCheckout}
              className="w-full sm:w-auto gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ir para o pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Planos e Créditos</h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha o plano ideal ou compre créditos avulsos.</p>
      </div>

      {/* Toggle */}
      <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.extra && <span className="text-xs ml-1 opacity-80">{t.extra}</span>}
          </button>
        ))}
      </div>

      {/* Subscription Plans */}
      {tab !== "oneoff" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPlans.map((plan, i) => {
            const price = tab === "annual" ? plan.annualPrice : plan.monthlyPrice;
            const priceDisplay = `R$ ${price % 1 === 0 ? price : price.toFixed(2).replace(".", ",")}`;
            const billing = tab === "annual" ? "annual" : "monthly";
            const isLoading = loadingPlan === `${plan.slug}_${billing}`;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative p-6 rounded-2xl border ${
                  plan.popular ? "border-accent shadow-glow bg-card" : "border-border bg-card shadow-soft"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Mais Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.credits}</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold">{priceDisplay}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>

                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={!!loadingPlan}
                  onClick={() => handleSubscribe(plan.slug, billing)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          {/* Enterprise Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: allPlans.length * 0.08 }}
            className="relative p-6 rounded-2xl border border-border bg-card shadow-soft"
          >
            <h3 className="text-xl font-bold mb-1">Enterprise</h3>
            <p className="text-xs text-muted-foreground mb-4">Créditos customizados</p>
            <div className="mb-6">
              <span className="text-2xl font-extrabold">Sob consulta</span>
            </div>

            <Button variant="outline" className="w-full mb-6" asChild>
              <a
                href="https://wa.me/5519974060016?text=Olá!%20Tenho%20interesse%20no%20plano%20Enterprise%20do%20BuscaLead."
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com especialista
              </a>
            </Button>

            <ul className="space-y-2">
              {enterpriseFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-foreground">{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* Credit Packs */}
      {tab === "oneoff" && (
        <div className="grid md:grid-cols-3 gap-6">
          {creditPacks.map((pack, i) => {
            const isLoading = loadingPlan === pack.id;
            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative p-6 rounded-2xl border ${
                  pack.popular ? "border-accent shadow-glow bg-card" : "border-border bg-card shadow-soft"
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Mais Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1">{pack.amount} créditos</h3>
                <p className="text-xs text-muted-foreground mb-4">R$ {pack.perCredit}/crédito</p>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold">R$ {pack.price}</span>
                  <span className="text-muted-foreground">,00</span>
                </div>
                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  disabled={!!loadingPlan}
                  onClick={() => handleBuyCredits(pack.id)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde...
                    </>
                  ) : (
                    "Comprar"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Garantia */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
      >
        <p className="font-semibold text-emerald-600 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Garantia de 7 dias
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas.
        </p>
      </motion.div>
    </div>
  );
}
