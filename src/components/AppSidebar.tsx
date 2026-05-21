import {
  LayoutDashboard, Users, Package, Tags, Store, ShoppingCart, ClipboardList, LogOut, Package2
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "GERENTE", "OPERADOR"] },
  { title: "Usuários", url: "/usuarios", icon: Users, roles: ["ADMIN", "GERENTE"] },
  { title: "Produtos", url: "/produtos", icon: Package, roles: ["ADMIN", "GERENTE"] },
  { title: "Marcas", url: "/marcas", icon: Tags, roles: ["ADMIN", "GERENTE"] },
  { title: "Lojas", url: "/lojas", icon: Store, roles: ["ADMIN", "GERENTE"] },
  { title: "Mix de Produtos", url: "/mix", icon: ShoppingCart, roles: ["ADMIN", "GERENTE"] },
  { title: "Meu Mix", url: "/meu-mix", icon: ClipboardList, roles: ["ADMIN", "GERENTE", "OPERADOR"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { usuario, logout } = useAuth();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(usuario?.cargo || "OPERADOR")
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-3 py-4">
            <Package2 className="h-5 w-5 text-sidebar-primary" />
            {!collapsed && <span className="font-bold text-sm">Paraíso</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
} 