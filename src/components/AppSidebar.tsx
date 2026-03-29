import {
  LayoutDashboard,
  Search,
  Users,
  CreditCard,
  Settings,
  Radar,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mainItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Nova Busca", url: "/app/busca", icon: Search },
  { title: "Meus Leads", url: "/app/leads", icon: Users },
  { title: "Créditos", url: "/app/creditos", icon: CreditCard },
  { title: "Configurações", url: "/app/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url || "";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const isActive = (path: string) =>
    path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <a href="/app" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Radar className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground">
              Busca<span className="text-accent">Lead</span>
            </span>
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink
                          to={item.url}
                          end={item.url === "/app"}
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {/* User info */}
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{userName}</span>
                      <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{userName}</TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className={`px-2 ${collapsed ? "flex justify-center" : ""}`}>
              <CreditsBadge />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground">
                  <a href="/">
                    <ExternalLink className="h-4 w-4" />
                    {!collapsed && <span>Voltar ao site</span>}
                  </a>
                </SidebarMenuButton>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  Voltar ao site
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  className="text-muted-foreground hover:text-destructive"
                  onClick={async () => { await signOut(); navigate("/login"); }}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  Sair
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}