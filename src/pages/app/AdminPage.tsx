import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Loader2,
  Users,
  CreditCard,
  Star,
  Receipt,
  Plus,
  Minus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface AdminUser {
  user_id: string;
  full_name: string | null;
  cpf: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  email: string | null;
  credit_balance: number | null;
  subscription_status: string | null;
  plan_name: string | null;
  plan_slug: string | null;
  billing_cycle: string | null;
  current_period_end: string | null;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  credits: number;
  plan_id: string;
  type: string;
  status: string | null;
  billing: string | null;
  created_at: string;
  processed_at: string | null;
  mp_payment_id: string | null;
}

export default function AdminPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Credit adjustment dialog
  const [creditDialog, setCreditDialog] = useState(false);
  const [creditUser, setCreditUser] = useState<AdminUser | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  // Plan change dialog
  const [planDialog, setPlanDialog] = useState(false);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  // User detail dialogs
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState<"credits" | "payments">("credits");

  const plans = [
    { slug: "free", name: "Free" },
    { slug: "starter", name: "Starter" },
    { slug: "pro", name: "Pro" },
    { slug: "business", name: "Business" },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      setUsers((data as AdminUser[]) || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.full_name?.toLowerCase().includes(term) ||
      u.cpf?.includes(term) ||
      u.company_name?.toLowerCase().includes(term)
    );
  });

  const handleAdjustCredits = async () => {
    if (!creditUser || !creditAmount || !creditDescription) {
      toast.error("Preencha todos os campos");
      return;
    }
    setCreditLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_adjust_credits", {
        p_target_user_id: creditUser.user_id,
        p_amount: parseInt(creditAmount),
        p_description: creditDescription,
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || "Erro");
      toast.success(
        `Créditos ajustados: ${result.balance_before} → ${result.balance_after}`
      );
      setCreditDialog(false);
      setCreditAmount("");
      setCreditDescription("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao ajustar créditos");
    } finally {
      setCreditLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!planUser || !selectedPlan) return;
    setPlanLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_update_subscription", {
        p_target_user_id: planUser.user_id,
        p_plan_slug: selectedPlan,
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || "Erro");
      toast.success(`Plano alterado para ${selectedPlan}`);
      setPlanDialog(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar plano");
    } finally {
      setPlanLoading(false);
    }
  };

  const openUserHistory = async (user: AdminUser) => {
    setDetailUser(user);
    setHistoryTab("credits");
    setHistoryLoading(true);
    try {
      const [creditsRes, paymentsRes] = await Promise.all([
        supabase.rpc("admin_list_credits", { p_target_user_id: user.user_id }),
        supabase.rpc("admin_list_payments", { p_target_user_id: user.user_id }),
      ]);
      if (creditsRes.error) throw creditsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      setCreditHistory((creditsRes.data as CreditTransaction[]) || []);
      setPaymentHistory((paymentsRes.data as PaymentRecord[]) || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar histórico");
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  const formatCpf = (cpf: string | null) =>
    cpf
      ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : "—";

  const transactionTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      purchase: "Compra",
      debit: "Débito",
      bonus: "Bônus",
      refund: "Estorno",
    };
    return map[t] || t;
  };

  const transactionTypeColor = (t: string) => {
    const map: Record<string, string> = {
      purchase: "default",
      debit: "destructive",
      bonus: "secondary",
      refund: "outline",
    };
    return (map[t] || "default") as any;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie usuários, créditos e assinaturas
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="h-4 w-4" /> Total de Usuários
          </div>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Star className="h-4 w-4" /> Com Plano Pago
          </div>
          <p className="text-2xl font-bold">
            {users.filter((u) => u.plan_slug && u.plan_slug !== "free").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CreditCard className="h-4 w-4" /> Créditos Totais
          </div>
          <p className="text-2xl font-bold">
            {users.reduce((sum, u) => sum + (u.credit_balance || 0), 0).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Receipt className="h-4 w-4" /> Cadastros Hoje
          </div>
          <p className="text-2xl font-bold">
            {users.filter((u) => {
              const today = new Date().toISOString().slice(0, 10);
              return u.created_at?.startsWith(today);
            }).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar por nome, e-mail, CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Créditos</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatCpf(user.cpf)}</TableCell>
                    <TableCell>
                      <Badge variant={user.plan_slug === "free" ? "outline" : "default"}>
                        {user.plan_name || "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {user.credit_balance?.toLocaleString("pt-BR") ?? 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreditUser(user);
                            setCreditDialog(true);
                          }}
                          title="Ajustar créditos"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPlanUser(user);
                            setSelectedPlan(user.plan_slug || "free");
                            setPlanDialog(true);
                          }}
                          title="Alterar plano"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserHistory(user)}
                          title="Ver histórico"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Credit Adjustment Dialog */}
      <Dialog open={creditDialog} onOpenChange={setCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Créditos</DialogTitle>
            <DialogDescription>
              Usuário: <strong>{creditUser?.full_name || creditUser?.email}</strong>
              <br />
              Saldo atual: <strong>{creditUser?.credit_balance?.toLocaleString("pt-BR") ?? 0}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Quantidade (positivo = adicionar, negativo = remover)
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCreditAmount("50")}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCreditAmount("100")}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCreditAmount("-50")}
                >
                  <Minus className="h-3 w-3 mr-1" />
                  50
                </Button>
              </div>
              <Input
                className="mt-2"
                type="number"
                placeholder="Ex: 100 ou -50"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Motivo</label>
              <Textarea
                placeholder="Descreva o motivo do ajuste..."
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustCredits} disabled={creditLoading}>
              {creditLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Usuário: <strong>{planUser?.full_name || planUser?.email}</strong>
              <br />
              Plano atual: <strong>{planUser?.plan_name || "Free"}</strong>
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Novo Plano</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={planLoading}>
              {planLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User History Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Histórico — {detailUser?.full_name || detailUser?.email}
            </DialogTitle>
            <DialogDescription>
              {detailUser?.email} • Saldo:{" "}
              {detailUser?.credit_balance?.toLocaleString("pt-BR") ?? 0} créditos
            </DialogDescription>
          </DialogHeader>

          <Tabs value={historyTab} onValueChange={(v) => setHistoryTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="credits" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Créditos
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credits">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : creditHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditHistory.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transactionTypeColor(tx.transaction_type)}>
                            {transactionTypeLabel(tx.transaction_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.description || "—"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${tx.amount >= 0 ? "text-green-600" : "text-destructive"}`}
                        >
                          {tx.amount >= 0 ? "+" : ""}
                          {tx.amount}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {tx.balance_after}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="payments">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pagamento encontrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Créditos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell className="text-sm">
                          {formatDate(pay.created_at)}
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {pay.type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pay.status === "approved"
                                ? "default"
                                : pay.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {pay.status || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          R$ {Number(pay.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {pay.credits}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
