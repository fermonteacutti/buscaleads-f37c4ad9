import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead, funnelLabel } from "./lead-types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FUNNEL_OPTIONS } from "./lead-types";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, Globe, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadDetailSheet from "./LeadDetailSheet";

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: Lead["funnel_status"]) => void;
  onLeadUpdated: () => void;
}

export default function LeadsTable({ leads, onStatusChange, onLeadUpdated }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const navigate = useNavigate();

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
              <TableHead className="min-w-[160px]">Contato</TableHead>
              <TableHead className="min-w-[100px]">Local</TableHead>
              <TableHead className="min-w-[100px]">Tags</TableHead>
              <TableHead className="w-[130px]">Funil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const funnel = funnelLabel(lead.funnel_status);
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
                    <div className="flex flex-col gap-0.5 max-w-[220px]">
                      {lead.email && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </span>
                      )}
                      {lead.website && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{lead.website}</span>
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
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
