import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead, FUNNEL_OPTIONS } from "@/components/leads/lead-types";
import LeadsTable from "@/components/leads/LeadsTable";
import { exportCSV } from "@/components/leads/export-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, RefreshCw, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 20;

interface LeadFilters {
  search: string;
  funnelStatus: string;
  state: string;
  hasEmail: boolean;
  hasPhone: boolean;
}

const DEFAULT_FILTERS: LeadFilters = { search: "", funnelStatus: "all", state: "", hasEmail: false, hasPhone: false };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      toast.error("Erro ao carregar leads");
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  // Status counts from ALL leads (unfiltered)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FUNNEL_OPTIONS.forEach((o) => (counts[o.value] = 0));
    leads.forEach((l) => {
      if (counts[l.funnel_status] !== undefined) counts[l.funnel_status]++;
    });
    return counts;
  }, [leads]);

  const filtered = useMemo(() => {
    let result = leads;
    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (l) =>
          l.company_name?.toLowerCase().includes(q) ||
          l.contact_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q)
      );
    }
    if (filters.funnelStatus !== "all") {
      result = result.filter((l) => l.funnel_status === filters.funnelStatus);
    }
    if (filters.state) {
      result = result.filter((l) => l.state?.toUpperCase() === filters.state);
    }
    if (filters.hasEmail) {
      result = result.filter((l) => !!l.email);
    }
    if (filters.hasPhone) {
      result = result.filter((l) => !!l.phone);
    }
    return result;
  }, [leads, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [filters]);

  const handleStatusChange = async (id: string, status: Lead["funnel_status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, funnel_status: status } : l)));
    const { error } = await supabase.from("leads").update({ funnel_status: status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status");
      fetchLeads();
    }
  };

  const update = (partial: Partial<LeadFilters>) => setFilters((f) => ({ ...f, ...partial }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Meus Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} lead{filtered.length !== 1 && "s"} encontrado{filtered.length !== 1 && "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Status counter cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {FUNNEL_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => update({ funnelStatus: filters.funnelStatus === o.value ? "all" : o.value })}
            className={cn(
              "rounded-lg border px-3 py-2 text-center transition-all",
              o.color,
              filters.funnelStatus === o.value ? "ring-2 ring-offset-1 ring-primary/50" : "opacity-80 hover:opacity-100"
            )}
          >
            <p className="text-lg font-bold">{statusCounts[o.value]}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide">{o.label}</p>
          </button>
        ))}
      </div>

      {/* Inline filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
            maxLength={100}
          />
        </div>
        <Input
          placeholder="UF"
          value={filters.state}
          onChange={(e) => update({ state: e.target.value.toUpperCase() })}
          maxLength={2}
          className="w-16"
        />
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <Checkbox checked={filters.hasEmail} onCheckedChange={(v) => update({ hasEmail: !!v })} />
          E-mail
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <Checkbox checked={filters.hasPhone} onCheckedChange={(v) => update({ hasPhone: !!v })} />
          Telefone
        </label>
      </div>

      {/* Table */}
      <LeadsTable leads={paginated} onStatusChange={handleStatusChange} onLeadUpdated={fetchLeads} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
