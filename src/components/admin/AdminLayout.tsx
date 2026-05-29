import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";
import { clearSession } from "@/services/auth.service";
import { useOrders, useMarkOrderAsPrinted } from "@/hooks/useOrders";
import { useEffect } from "react";

function OrderAutoPrintListener() {
  const { data } = useOrders(undefined, undefined, undefined, undefined, 1, 10, undefined, { refetchInterval: 10000 });
  const markOrderAsPrintedMutation = useMarkOrderAsPrinted();
  
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      const newOrders = data.data.filter((o: any) => o.isPrinted === false);
      
      if (newOrders.length > 0) {
        newOrders.forEach((order: any) => {
          order.isPrinted = true;
          window.open(`/pedidos/${order.id}/imprimir`, '_blank');
          markOrderAsPrintedMutation.mutate(order.id);
        });
      }
    }
  }, [data, markOrderAsPrintedMutation]);

  return null;
}

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                Administrador
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <OrderAutoPrintListener />
    </SidebarProvider>
  );
}
