import { useOrderDetails, useCancelOrder } from "@/hooks/useOrders";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Copy, 
  Printer, 
  Download, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Check, 
  Loader2 
} from "lucide-react";
import { useState } from "react";
import { OrderStatus } from "@/types/order";

interface OrderDetailDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Pendente", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Confirmado", bg: "bg-blue-100", text: "text-blue-700" },
  DISPATCHED: { label: "Despachado", bg: "bg-purple-100", text: "text-purple-700" },
  COMPLETED: { label: "Entregue", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Cancelado", bg: "bg-rose-100", text: "text-rose-700" },
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  "Cartão de Crédito": "Cartão de Crédito",
  "Cartão de Débito": "Cartão de Débito",
  Dinheiro: "Dinheiro",
};

export default function OrderDetailDrawer({ orderId, isOpen, onClose }: OrderDetailDrawerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const { data: order, isLoading } = useOrderDetails(orderId ?? "");
  const cancelMutation = useCancelOrder();

  const handleCopyAddress = () => {
    if (!order) return;
    const addressStr = `${order.street}, ${order.number}
${order.neighborhood} - ${order.complement ?? ""}
${order.city} - ${order.state}
CEP: ${order.cep}`;
    
    navigator.clipboard.writeText(addressStr);
    setCopied(true);
    toast({
      title: "Endereço copiado!",
      description: "Endereço formatado foi copiado para a área de transferência.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    try {
      await cancelMutation.mutateAsync(orderId);
      toast({
        title: "Pedido cancelado",
        description: `O pedido #${order?.orderNumber} foi cancelado com sucesso.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar pedido",
        description: err.message || "Ocorreu um erro ao processar o cancelamento.",
      });
    }
  };

  const formattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", " -");
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 border border-slate-200 shadow-2xl flex flex-col justify-between rounded-2xl">
        {/* Adiciona DialogTitle escondido ou visível para acessibilidade */}
        <DialogTitle className="sr-only">Detalhes do Pedido</DialogTitle>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm text-slate-500 font-medium animate-pulse">Carregando detalhes do pedido...</p>
          </div>
        ) : order ? (
          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Main scrollable body */}
            <div className="space-y-6">
              {/* Header with back button and fast action icons */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button 
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-violet-700 transition-colors text-sm font-semibold group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Voltar</span>
                </button>

                {/* Quick actions top-right */}
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" title="Compartilhar">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                  <a 
                    href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" 
                    title="WhatsApp"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </a>
                  <button 
                    onClick={handleCopyAddress} 
                    className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" 
                    title="Copiar dados"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" title="Imprimir">
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" title="Download PDF">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 hover:text-violet-700 transition-colors" title="Editar">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Order summary card with main data */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800 tracking-tight">Pedido #{order.orderNumber}</span>
                  <Badge className={`${statusConfig[order.status].bg} ${statusConfig[order.status].text} hover:${statusConfig[order.status].bg} border-0 px-2.5 py-0.5 font-medium rounded-full`}>
                    {statusConfig[order.status].label}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {formattedDate(order.createdAt)}
                </div>
                
                {/* Client info expandable header style */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">{order.customerName}</div>
                      <a 
                        href={`tel:${order.customerPhone}`}
                        className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1 mt-0.5 font-medium"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product items section */}
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Itens do Pedido</div>
                <div className="space-y-3 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm max-h-[220px] overflow-y-auto">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* Image Thumbnail with Circular quantity badge overlay */}
                      <div className="relative shrink-0 w-11 h-11 bg-slate-100 border border-slate-200/80 rounded-lg overflow-hidden flex items-center justify-center">
                        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md z-10">
                          {item.quantity}
                        </div>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">P+</span>
                        )}
                      </div>
                      
                      {/* Name with line connector to price */}
                      <div className="flex-1 flex items-baseline justify-between min-w-0">
                        <div className="truncate pr-1">
                          <span className="text-xs font-bold text-slate-700 leading-tight">{item.productName}</span>
                          {item.variation && (
                            <span className="block text-[10px] text-slate-400 font-medium truncate mt-0.5">({item.variation})</span>
                          )}
                        </div>
                        <div className="flex-1 border-b border-dashed border-slate-200 mx-2 mb-1" />
                        <span className="text-xs font-bold text-slate-700 shrink-0">
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial values summary calculations */}
              <div className="space-y-2.5 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Total dos itens ({order.items.length})</span>
                  <span>R$ {order.itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Frete</span>
                  <span>R$ {order.freight.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Desconto</span>
                    <span>-R$ {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2.5">
                  <span>Total pedido</span>
                  <span>R$ {order.totalOrder.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 bg-emerald-50/50 p-2 rounded-lg mt-1">
                  <span>Total recebido</span>
                  <span>R$ {order.totalReceived.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-2.5 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Pagamento</span>
                  <span className="text-slate-800 font-bold">{order.paymentType}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Forma de pagamento</span>
                  <span className="text-slate-800 font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                {order.pixKey && (
                  <div className="flex justify-between text-slate-500">
                    <span>Chave PIX</span>
                    <span className="text-slate-800 font-mono text-xs">{order.pixKey}</span>
                  </div>
                )}
              </div>

              {/* Shipping Address Section */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Endereço de Entrega</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyAddress}
                    className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2 gap-1 rounded-md"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiar endereço</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium space-y-0.5">
                  <div className="font-bold text-slate-800">{order.street}, {order.number}</div>
                  <div>{order.neighborhood} {order.complement ? `- ${order.complement}` : ""}</div>
                  <div>{order.city} - {order.state}</div>
                  <div className="font-mono text-slate-500 mt-1">CEP: {order.cep}</div>
                </div>
              </div>
            </div>

            {/* Footer Buttons aligned side-by-side */}
            <div className="flex items-center gap-3 pt-6 border-t border-slate-200/80 bg-slate-50/98 mt-6">
              {order.status !== "CANCELLED" && order.status !== "COMPLETED" ? (
                <Button 
                  variant="destructive"
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 font-bold rounded-xl transition-all shadow-md hover:shadow-rose-100"
                  disabled={cancelMutation.isPending}
                  onClick={handleCancelOrder}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    <span>Cancelar Pedido</span>
                  )}
                </Button>
              ) : null}
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100/80 transition-all"
              >
                Voltar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-sm font-medium">Pedido não encontrado.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
