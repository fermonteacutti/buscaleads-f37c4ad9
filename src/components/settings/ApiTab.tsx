import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Loader2, Lock, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

function generateApiKey(): { full: string; prefix: string } {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 32; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const full = `bl_sk_live_${random}`;
  const prefix = `bl_sk_live_${random.slice(0, 6)}`;
  return { full, prefix };
}

export default function ApiTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Fetch current plan
  useEffect(() => {
    if (!user) return;
    const fetchPlan = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_id, status, plans(slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (data?.plans) {
        const plans = data.plans as any;
        setCurrentPlanSlug(plans.slug || null);
      }
      setLoadingPlan(false);
    };
    fetchPlan();
  }, [user]);

  const isFreePlan = !currentPlanSlug || currentPlanSlug === "free";

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar chaves de API.");
    } else {
      setKeys((data as ApiKey[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!user) return;
    const name = newKeyName.trim() || "Chave padrão";
    setCreating(true);

    const { full, prefix } = generateApiKey();

    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name,
      key_value: full,
      key_prefix: prefix,
    });

    setCreating(false);

    if (error) {
      toast.error("Erro ao criar chave de API.");
      return;
    }

    setJustCreatedKey(full);
    setNewKeyName("");
    toast.success("Chave de API criada! Copie-a agora, ela não será exibida novamente.");
    fetchKeys();
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao revogar chave.");
    } else {
      toast.success("Chave revogada com sucesso.");
      fetchKeys();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir chave.");
    } else {
      toast.success("Chave excluída.");
      fetchKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeKeys = keys.filter((k) => k.is_active);
  const revokedKeys = keys.filter((k) => !k.is_active);

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isFreePlan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">API não disponível no plano Free</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Disponível a partir do plano Starter. Faça upgrade para acessar a API e integrar seus leads com sistemas externos.
            </p>
          </div>
          <Button onClick={() => navigate("/app/planos")} className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Fazer upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan info note */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">🔑 API disponível</strong> — Você tem acesso à API nos planos Starter, Pro e Business.
          Gerencie suas chaves abaixo para integrar seus leads com sistemas externos.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Criar nova chave
          </CardTitle>
          <CardDescription>
            Gere uma nova chave de API para acessar seus leads programaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="keyName">Nome da chave (opcional)</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ex: Integração CRM, Script Python..."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Gerar chave
              </Button>
            </div>
          </div>

          {justCreatedKey && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                🔑 Sua nova chave foi criada! Copie-a agora — ela não será exibida novamente.
              </p>
              <div className="flex gap-2">
                <Input
                  value={justCreatedKey}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(justCreatedKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJustCreatedKey(null)}
                className="text-xs text-muted-foreground"
              >
                Entendi, já copiei
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Chaves ativas
          </CardTitle>
          <CardDescription>
            Gerencie suas chaves de API ativas. Revogue chaves que não são mais necessárias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma chave ativa. Crie uma acima para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {activeKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-md border border-border p-4"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{key.name}</p>
                      <Badge variant="default" className="text-[10px]">Ativa</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">
                        {visibleKeys.has(key.id) ? key.key_value : `${key.key_prefix}••••••••••••`}
                      </code>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(key.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(key.key_value)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Criada em {new Date(key.created_at).toLocaleDateString("pt-BR")}
                      {key.last_used_at &&
                        ` · Último uso: ${new Date(key.last_used_at).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Revogar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revogar chave "{key.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A chave será desativada imediatamente. Qualquer sistema que a utilize
                          perderá acesso à API. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevoke(key.id)}>
                          Revogar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Chaves revogadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {revokedKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-4 opacity-70"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground line-through">{key.name}</p>
                    <Badge variant="secondary" className="text-[10px]">Revogada</Badge>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {key.key_prefix}••••••••••••
                  </code>
                  <p className="text-[11px] text-muted-foreground">
                    Revogada em{" "}
                    {key.revoked_at
                      ? new Date(key.revoked_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir chave permanentemente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é irreversível. O registro da chave será removido completamente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(key.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* API Usage example */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
            <pre>{`curl -X GET "https://api.buscalead.com/v1/leads" \\
  -H "Authorization: Bearer bl_sk_live_xxxx" \\
  -H "Content-Type: application/json"`}</pre>
          </div>
          <div className="rounded-md border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Limite de requisições:</strong> 100 req/min no plano atual.
              Atualize seu plano para limites maiores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
