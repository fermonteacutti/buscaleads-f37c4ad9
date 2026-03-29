import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp, Sparkles, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
      { label: "Exportação CSV/Excel", included: true },
      { label: "Google Maps", included: true },
      { label: "Até 500 leads salvos", included: true },
      { label: "Suporte e-mail (72h)", included: true },
      { label: "Todas as fontes", included: false },
      { label: "Funil completo", included: false },
    ],
  },
  {
    name: "Pro",
    slug: "pro",
    monthlyPrice: 97,
    annualPrice: 82.45,
    credits: "500 créditos/mês",
    popular: true,
    cta: "Assinar Pro",
    features: [
      { label: "500 créditos/mês", included: true },
      { label: "3 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes", included: true },
      { label: "Até 2.000 leads salvos", included: true },
      { label: "Suporte prioritário (24h)", included: true },
      { label: "Funil completo", included: true },
      { label: "Enriquecimento de dados", included: false },
    ],
  },
  {
    name: "Business",
    slug: "business",
    monthlyPrice: 197,
    annualPrice: 167.45,
    credits: "1.500 créditos/mês",
    popular: false,
    cta: "Assinar Business",
    features: [
      { label: "1.500 créditos/mês", included: true },
      { label: "5 buscas simultâneas", included: true },
      { label: "Exportação CSV/Excel", included: true },
      { label: "Todas as fontes", included: true },
      { label: "Leads ilimitados salvos", included: true },
      { label: "Suporte VIP (12h)", included: true },
      { label: "Funil completo", included: true },
      { label: "Enriquecimento de dados", included: true },
    ],
  },
];

const creditPacks = [
  { id: "pack_100", amount: 100, price: 29, perCredit: "0,29" },
  { id: "pack_300", amount: 300, price: 59, perCredit: "0,20", popular: true },
  { id: "pack_1000", amount: 1000, price: 149, perCredit: "0,15" },
];

export default function AppPricingPage() {
  const [tab, setTab] = useState<BillingTab>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const tabs: { value: BillingTab; label: string; extra?: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "annual", label: "Anual", extra: "-15%" },
    { value: "oneoff", label: "Avulso" },
  ];

  const handleSubscribe = async (planSlug: string, billing: "monthly" | "annual") => {
    const key = `${planSlug}_${billing}`;
    setLoadingPlan(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { type: "plan", plan_id: planSlug, billing },
      });
      if (error) throw error;
      if (data?.sandbox_init_point) {
        window.location.href = data.sandbox_init_point;
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
      if (data?.sandbox_init_point) {
        window.location.href = data.sandbox_init_point;
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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
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
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan, i) => {
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
    </div>
  );
}
