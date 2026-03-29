import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BillingTab = "monthly" | "annual" | "oneoff";

const subscriptionPlans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: "50 créditos únicos",
    popular: false,
    cta: "Começar Grátis",
    features: [
      { label: "50 créditos (único)", included: true },
      { label: "1 busca simultânea", included: true },
      { label: "Exportação CSV", included: true },
      { label: "Google Maps", included: true },
      { label: "Até 50 leads salvos", included: true },
      { label: "Suporte comunidade", included: true },
      { label: "Exportação Excel", included: false },
      { label: "Todas as fontes", included: false },
      { label: "Funil completo", included: false },
    ],
  },
  {
    name: "Starter",
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
      { label: "API Access", included: false },
    ],
  },
  {
    name: "Pro",
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

const oneOffPacks = [
  { credits: 100, price: 29, badge: null },
  { credits: 300, price: 59, badge: "Mais popular" },
  { credits: 1000, price: 149, badge: "Melhor valor" },
];

const faqs = [
  { q: "O que são créditos?", a: "Cada crédito equivale a 1 lead coletado. Fontes premium podem consumir mais créditos por lead." },
  { q: "Posso trocar de plano?", a: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor é calculado proporcionalmente." },
  { q: "Os créditos acumulam?", a: "Não. Créditos mensais não utilizados expiram no final do ciclo de 30 dias. Créditos avulsos não expiram." },
  { q: "Existe período de teste?", a: "O plano Free oferece 50 créditos para você experimentar a plataforma sem compromisso." },
  { q: "Como funciona o cancelamento?", a: "Cancele quando quiser sem multa. Você mantém acesso até o fim do período pago." },
  { q: "Os dados são seguros?", a: "Sim. Usamos criptografia SSL, conformidade LGPD e os dados ficam em servidores seguros." },
];

export default function PricingPage() {
  const [tab, setTab] = useState<BillingTab>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tabs: { value: BillingTab; label: string; extra?: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "annual", label: "Anual", extra: "-15%" },
    { value: "oneoff", label: "Avulso" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Planos simples, resultados <span className="text-gradient">extraordinários</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Escolha o plano ideal para o tamanho da sua operação.
            </p>

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
          </motion.div>

          {/* Subscription Plans */}
          {tab !== "oneoff" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan, i) => {
                const price = tab === "annual" ? plan.annualPrice : plan.monthlyPrice;
                const priceDisplay = price === 0 ? "Grátis" : `R$ ${price % 1 === 0 ? price : price.toFixed(2).replace(".", ",")}`;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative p-8 rounded-2xl border ${
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
                      <span className="text-4xl font-extrabold">{priceDisplay}</span>
                      {price > 0 && <span className="text-muted-foreground">/mês</span>}
                    </div>

                    <Button variant={plan.popular ? "hero" : "outline"} className="w-full mb-6" asChild>
                      <Link to={`/login?cadastro=true&plano=${plan.name.toLowerCase()}`}>{plan.cta}</Link>
                    </Button>

                    <ul className="space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat.label} className="flex items-center gap-2 text-sm">
                          {feat.included ? (
                            <Check className="h-4 w-4 text-success flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span className={feat.included ? "text-foreground" : "text-muted-foreground/50"}>
                            {feat.label}
                          </span>
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
                transition={{ delay: subscriptionPlans.length * 0.08 }}
                className="relative p-8 rounded-2xl border border-border bg-card shadow-soft lg:col-span-1 md:col-span-2 lg:col-span-1"
              >
                <h3 className="text-xl font-bold mb-1">Enterprise</h3>
                <p className="text-xs text-muted-foreground mb-4">Créditos customizados</p>
                <div className="mb-6">
                  <span className="text-2xl font-extrabold">Sob consulta</span>
                </div>

                <Button variant="outline" className="w-full mb-6" asChild>
                  <a
                    href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20plano%20Enterprise."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar com especialista
                  </a>
                </Button>

                <ul className="space-y-3">
                  {[
                    "Créditos customizados",
                    "Usuários ilimitados",
                    "SLA dedicado",
                    "CRM incluso",
                    "Gerente de conta",
                    "Onboarding personalizado",
                    "API Access",
                    "Todas as fontes de dados",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          )}

          {/* One-off Credits */}
          {tab === "oneoff" && (
            <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              {oneOffPacks.map((pack, i) => (
                <motion.div
                  key={pack.credits}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative p-8 rounded-2xl border border-border bg-card shadow-soft text-center"
                >
                  {pack.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                      {pack.badge}
                    </Badge>
                  )}
                  <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{pack.credits.toLocaleString("pt-BR")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">créditos</p>
                  <div className="mb-6">
                    <span className="text-3xl font-extrabold">R$ {pack.price}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Comprar créditos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    R$ {(pack.price / pack.credits).toFixed(2).replace(".", ",")} por crédito
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Garantia */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-14 max-w-2xl mx-auto text-center p-6 rounded-xl border border-success/20 bg-success/5"
          >
            <p className="font-semibold text-success flex items-center justify-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Garantia de 7 dias
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-background">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
