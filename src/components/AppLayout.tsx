import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/50 px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="py-3 px-6 flex items-center justify-between border-t border-border/50 bg-card/50 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Paraíso Distribuidora. Todos os direitos reservados.</span>
            <span className="font-semibold tracking-wide text-foreground">POWERED BY SAVANT</span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
