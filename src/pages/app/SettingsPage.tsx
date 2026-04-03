import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Building2, Phone, Lock, Webhook, Key, Bell } from "lucide-react";
import ApiTab from "@/components/settings/ApiTab";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seu perfil, integrações e preferências.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            <User className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">
            <Webhook className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm">
            <Key className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            API
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1.5 hidden sm:inline-block" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="api">
          <ApiTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Profile Tab ─── */
function ProfileTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, company_name, phone")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setCompanyName(data.company_name || "");
          setPhone(data.phone || "");
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company_name: companyName, phone })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error("Erro ao alterar senha.");
    } else {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados pessoais
          </CardTitle>
          <CardDescription>Atualize seu nome, empresa e telefone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="pl-9" placeholder="Nome da empresa" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="(11) 99999-9999" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Alterar senha
          </CardTitle>
          <CardDescription>Defina uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">
              {changingPassword ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Integrations Tab ─── */
function IntegrationsTab() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState({
    newLead: true,
    leadUpdated: false,
    searchCompleted: true,
  });

  const crmIntegrations = [
    { name: "HubSpot", description: "Envie leads automaticamente para o HubSpot CRM", connected: false, icon: "🟠" },
    { name: "Pipedrive", description: "Sincronize leads com seu pipeline do Pipedrive", connected: false, icon: "🟢" },
    { name: "RD Station", description: "Integre com RD Station CRM e Marketing", connected: false, icon: "🔵" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Receba notificações em tempo real quando novos leads forem encontrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://seu-servidor.com/webhook"
            />
          </div>

          <div className="space-y-3">
            <Label>Eventos</Label>
            {[
              { key: "newLead" as const, label: "Novo lead encontrado" },
              { key: "leadUpdated" as const, label: "Lead atualizado" },
              { key: "searchCompleted" as const, label: "Busca concluída" },
            ].map((evt) => (
              <div key={evt.key} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm text-foreground">{evt.label}</span>
                <Switch
                  checked={webhookEvents[evt.key]}
                  onCheckedChange={(v) => setWebhookEvents((prev) => ({ ...prev, [evt.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => toast.info("Em breve! Webhooks serão ativados na próxima atualização.")}>
              Salvar webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações CRM</CardTitle>
          <CardDescription>Conecte seus CRMs favoritos para sincronizar leads automaticamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {crmIntegrations.map((crm) => (
            <div key={crm.name} className="flex items-center justify-between rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{crm.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{crm.name}</p>
                  <p className="text-xs text-muted-foreground">{crm.description}</p>
                </div>
              </div>
              {crm.connected ? (
                <Badge variant="default" className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">Conectado</Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground">Em breve</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ApiTab is now in src/components/settings/ApiTab.tsx */

/* ─── Notifications Tab ─── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailNewLeads: true,
    emailSearchComplete: true,
    emailLowCredits: true,
    emailWeeklyReport: false,
    pushNewLeads: false,
    pushSearchComplete: false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações por e-mail
          </CardTitle>
          <CardDescription>Escolha quais alertas deseja receber por e-mail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "emailNewLeads" as const, label: "Novos leads encontrados", desc: "Receba um e-mail quando uma busca encontrar novos leads" },
            { key: "emailSearchComplete" as const, label: "Busca concluída", desc: "Notificação quando uma busca terminar de processar" },
            { key: "emailLowCredits" as const, label: "Créditos baixos", desc: "Alerta quando seus créditos estiverem acabando" },
            { key: "emailWeeklyReport" as const, label: "Relatório semanal", desc: "Resumo semanal de leads e atividades" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações push</CardTitle>
          <CardDescription>Receba alertas diretamente no navegador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "pushNewLeads" as const, label: "Novos leads", desc: "Push notification para novos leads" },
            { key: "pushSearchComplete" as const, label: "Busca concluída", desc: "Push notification ao concluir buscas" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button onClick={() => toast.success("Preferências de notificação salvas!")}>
              Salvar preferências
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
