import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingBag, Calendar, ArrowRight, Loader2 } from "lucide-react";
import OrderDetailDrawer from "@/components/OrderDetailDrawer";
import { OrderStatus } from "@/types/order";

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Pendente", bg: "bg-amber-100/80 text-amber-700", text: "text-amber-700" },
  CONFIRMED: { label: "Confirmado", bg: "bg-blue-100/80 text-blue-700", text: "text-blue-700" },
  DISPATCHED: { label: "Despachado", bg: "bg-purple-100/80 text-purple-700", text: "text-purple-700" },
  COMPLETED: { label: "Entregue", bg: "bg-emerald-100/80 text-emerald-700", text: "text-emerald-700" },
  CANCELLED: { label: "Cancelado", bg: "bg-rose-100/80 text-rose-700", text: "text-rose-700" },
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  "Cartão de Crédito": "Crédito",
  "Cartão de Débito": "Débito",
  Dinheiro: "Dinheiro",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useOrders(search, status);

  // Group orders chronologically by date
  const groupOrdersByDate = (orderList: typeof orders) => {
    const groups: Record<string, typeof orders> = {};
    
    orderList.forEach((order) => {
      const date = new Date(order.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateStr = "";
      if (date.toDateString() === today.toDateString()) {
        dateStr = "Hoje";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateStr = "Ontem";
      } else {
        dateStr = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(order);
    });
    
    return groups;
  };

  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1.5 md:px-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-violet-600" />
            <span>Pedidos</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gerencie suas vendas e acompanhe os status de entrega em tempo real.</p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Buscar por ID ou nome do cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus-visible:ring-violet-600 rounded-xl font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-48">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 border-slate-200 focus:ring-violet-600 rounded-xl font-semibold text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="font-semibold rounded-md">Todos</SelectItem>
              <SelectItem value="PENDING" className="font-semibold rounded-md">Pendente</SelectItem>
              <SelectItem value="CONFIRMED" className="font-semibold rounded-md">Confirmado</SelectItem>
              <SelectItem value="DISPATCHED" className="font-semibold rounded-md">Despachado</SelectItem>
              <SelectItem value="COMPLETED" className="font-semibold rounded-md">Entregue</SelectItem>
              <SelectItem value="CANCELLED" className="font-semibold rounded-md">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Panel */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white/40 border border-slate-200/50 rounded-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm font-semibold text-slate-500">Carregando lista de vendas...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/70 border border-slate-200/50 rounded-2xl text-center p-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Nenhum pedido encontrado</h3>
            <p className="text-xs text-slate-400 max-w-xs font-medium">Tente ajustar seus filtros de busca ou verifique se há novas vendas.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([date, items]) => (
            <div key={date} className="space-y-3">
              {/* Chronological Header Date bar */}
              <div className="flex items-center gap-2 text-slate-400 px-1 font-bold text-xs uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                <span>{date}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />
                <span>{items.length} {items.length === 1 ? 'venda' : 'vendas'}</span>
              </div>

              {/* Grid representation */}
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((order) => (
                  <Card 
                    key={order.id} 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="group cursor-pointer hover:bg-slate-50/50 border-slate-200/60 hover:border-violet-300 transition-all duration-300 hover:shadow-md active:scale-[0.99] rounded-2xl overflow-hidden"
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-mono font-bold text-slate-400">#{order.orderNumber}</div>
                          <div className="font-bold text-slate-700 truncate leading-tight group-hover:text-violet-700 transition-colors">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <Badge className={`${statusConfig[order.status].bg} shadow-none font-bold rounded-full text-[10px] px-2.5 py-0.5 border-0 shrink-0`}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total</span>
                          <span className="text-base font-extrabold text-slate-800">
                            R$ {order.totalOrder.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {paymentLabels[order.paymentMethod] || order.paymentMethod}
                          </Badge>
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all shrink-0">
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sheet Details Drawer */}
      <OrderDetailDrawer 
        orderId={selectedOrderId} 
        isOpen={!!selectedOrderId} 
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
