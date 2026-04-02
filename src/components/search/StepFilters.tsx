import { useWizard } from "./SearchWizardContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Filter, Mail, Phone, Globe, Share2, Users } from "lucide-react";

const FILTERS = [
  { key: "hasEmail" as const, label: "Possui e-mail", description: "Apenas empresas com e-mail de contato", icon: Mail },
  { key: "hasPhone" as const, label: "Possui telefone", description: "Apenas empresas com número de telefone", icon: Phone },
  { key: "hasWebsite" as const, label: "Possui website", description: "Apenas empresas com site próprio", icon: Globe },
  { key: "hasSocialMedia" as const, label: "Possui redes sociais", description: "Apenas empresas com perfis em redes", icon: Share2 },
];

export default function StepFilters() {
  const { data, updateData } = useWizard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" /> Filtros Avançados
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Refine os resultados com filtros opcionais.</p>
      </div>

      <div className="space-y-3">
        {FILTERS.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3 rounded-xl border border-border p-4 bg-card">
            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={data[key]}
              onCheckedChange={(v) => updateData({ [key]: v })}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <Label className="text-sm font-medium">Quantidade de leads desejados</Label>
        </div>
        <RadioGroup
          value={String(data.maxLeads)}
          onValueChange={(v) => updateData({ maxLeads: Number(v) })}
          className="grid grid-cols-4 gap-2"
        >
          {[5, 20, 50, 100, 200].map((n) => (
            <Label
              key={n}
              htmlFor={`qty-${n}`}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors ${
                data.maxLeads === n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={String(n)} id={`qty-${n}`} className="sr-only" />
              <span className="text-sm font-semibold">{n}</span>
            </Label>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">Leads duplicados de buscas anteriores serão ignorados automaticamente.</p>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="searchName">Nome da busca (opcional)</Label>
        <Input
          id="searchName"
          placeholder="Ex: Restaurantes SP - Março 2026"
          value={data.searchName}
          onChange={(e) => updateData({ searchName: e.target.value })}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">Facilita a identificação posterior no histórico.</p>
      </div>
    </div>
  );
}
