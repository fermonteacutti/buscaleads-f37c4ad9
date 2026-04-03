import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead, funnelLabel } from "./lead-types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUNNEL_OPTIONS } from "./lead-types";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, Globe, MapPin, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadDetailSheet from "./LeadDetailSheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: Lead["funnel_status"]) => void;
  onLeadUpdated: () => void;
}

function hasRealEmail(email: string | null): boolean {
  return !!email && !email.includes("@sem-email.interno");
}

function hasWhatsApp(website: string | null): boolean {
  if (!website) return false;
  const lower = website.toLowerCase();
  return lower.includes("whatsapp") || lower.includes("wa.me");
}

export default function LeadsTable({ leads, onStatusChange, onLeadUpdated }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProspect = async (lead: Lead) => {
    if (!hasRealEmail(lead.email)) return;
    setSendingId(lead.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-prospecting-email", {
        body: { lead_id: lead.id, to_email: lead.email, to_name: lead.contact_name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("E-mail de prospecção enviado!");
      onStatusChange(lead.id, "contacted");
    } catch (err: any) {
      toast.error("Falha ao enviar e-mail: " + (err.message || "Erro desconhecido"));
    } finally {
      setSendingId(null);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum lead encontrado</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Ajuste os filtros ou inicie uma nova busca.</p>
        <Button variant="default" size="sm" className="mt-4" onClick={() => navigate("/app/busca")}>
          <Search className="h-4 w-4 mr-1" /> Nova Busca
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[180px]">Empresa</TableHead>
              <TableHead className="min-w-[120px]">Contato</TableHead>
              <TableHead className="min-w-[100px]">Local</TableHead>
              <TableHead className="min-w-[100px]">Tags</TableHead>
              <TableHead className="w-[130px]">Funil</TableHead>
              <TableHead className="w-[80px] text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const funnel = funnelLabel(lead.funnel_status);
              const showProspect = hasRealEmail(lead.email);
              const isSending = sendingId === lead.id;
              return (
                <TableRow
                  key={lead.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell className="py-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                      {lead.company_name || "Sem nome"}
                    </p>
                    {lead.contact_name && (
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">{lead.contact_name}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      {lead.phone && (
                        <span title={lead.phone} className="text-muted-foreground">
                          <Phone className="h-4 w-4" />
                        </span>
                      )}
                      {hasRealEmail(lead.email) && (
                        <span title={lead.email!} className="text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </span>
                      )}
                      {hasWhatsApp(lead.website) && (
                        <span title="WhatsApp" className="text-emerald-600">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {(lead.city || lead.state) ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{[lead.city, lead.state].filter(Boolean).join(" - ")}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {lead.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 whitespace-nowrap">
                          {tag}
                        </Badge>
                      ))}
                      {(lead.tags?.length ?? 0) > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{(lead.tags?.length ?? 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={lead.funnel_status}
                      onValueChange={(v) => onStatusChange(lead.id, v as Lead["funnel_status"])}
                    >
                      <SelectTrigger className={cn("h-7 text-xs border", funnel.color)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNNEL_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", o.dotColor)} />
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {showProspect && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        title="Enviar e-mail de prospecção"
                        disabled={isSending}
                        onClick={() => handleProspect(lead)}
                      >
                        <Send className={cn("h-4 w-4", isSending && "animate-pulse")} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        onUpdated={() => {
          setSelectedLead(null);
          onLeadUpdated();
        }}
      />
    </>
  );
}
