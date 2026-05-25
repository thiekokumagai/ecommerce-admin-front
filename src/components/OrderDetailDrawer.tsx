import { useOrderDetails, useCancelOrder, useReceiveOrder, useRevertReceiveOrder, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useSettings } from "@/hooks/useSettings";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { buildImageUrl } from "@/utils/image-url";
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
import { useState, useEffect } from "react";
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
  const { data: settings } = useSettings();
  const cancelMutation = useCancelOrder();
  const receiveMutation = useReceiveOrder();
  const revertReceiveMutation = useRevertReceiveOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [localStatus, setLocalStatus] = useState<OrderStatus | "">("");
  const [manualDiscount, setManualDiscount] = useState(0);
  const [pixDiscount, setPixDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [cardSurcharge, setCardSurcharge] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [installments, setInstallments] = useState<number>(1);
  const [copiedName, setCopiedName] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const isPaid = order ? (order.paymentStatus === "PAID" || order.status === "COMPLETED" || order.status === "CANCELLED") : false;


  useEffect(() => {
    if (order) {
      setPaymentMethod(order.paymentMethod || "");
      setInstallments(order.installments || 1);
      setLocalStatus(order.status);

      const isCurrentlyPaid = order.paymentStatus === "PAID" || order.status === "COMPLETED" || order.status === "CANCELLED";

      if (isCurrentlyPaid) {
        setManualDiscount(order.discount || 0);
        setPixDiscount(order.pixDiscount || 0);
        setSurcharge(order.surcharge || 0);
        setCardSurcharge(order.cardSurcharge || 0);
        setTotalReceived(order.totalReceived > 0 ? order.totalReceived : (order.totalOrder || 0));
      } else {
        let initialDiscount = order.discount || 0;
        
        if (order.coupon && order.coupon.type === 'FREE_SHIPPING' && initialDiscount === 0) {
          initialDiscount = order.freight;
        }

        setManualDiscount(initialDiscount);
        setSurcharge(0);
        const method = order.paymentMethod || "";
        const baseTotal = order.itemsTotal + order.freight;
        let initialPixDiscount = 0;
        let initialCardSurcharge = 0;
        let inst = order.installments || 1;
        const amountForFee = baseTotal - initialDiscount;
        const productDiscount = (order.coupon?.type === 'FREE_SHIPPING') ? 0 : initialDiscount;
        const baseForPix = Math.max(0, order.itemsTotal - productDiscount);

        if (method === "PIX") {
          const pixRule = settings?.paymentRules?.find((r: any) => r.paymentMethod === "pix" && r.type === "discount");
          if (pixRule && typeof pixRule.value === "number") {
            initialPixDiscount = Math.round((baseForPix * (pixRule.value / 100)) * 100) / 100;
          }
        } else if (method === "Cartão de Crédito") {
          const creditRules = settings?.paymentRules?.filter((r: any) => r.paymentMethod === "credit" && r.type === "charge") || [];
          const activeRule = creditRules.find((r: any) => inst >= (r.parcelaMin || 0) && inst <= (r.parcelaMax || 99));
          if (activeRule && typeof activeRule.value === "number" && activeRule.passedToCustomer !== false) {
            initialCardSurcharge = Math.round((amountForFee * (activeRule.value / 100)) * 100) / 100;
          }
        }

        setPixDiscount(initialPixDiscount);
        setCardSurcharge(initialCardSurcharge);
        setTotalReceived(Math.round((baseTotal + initialCardSurcharge - initialPixDiscount - initialDiscount) * 100) / 100);
      }
    }
  }, [order, settings]);

  const handleStatusChange = async (val: string) => {
    if (!order) return;
    const newStatus = val as OrderStatus;
    setLocalStatus(newStatus);
    try {
      await updateStatusMutation.mutateAsync({ id: order.id, payload: { status: newStatus } });
      toast({ title: "Status atualizado com sucesso!" });
    } catch (e) {
      setLocalStatus(order.status);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  const handleTotalChange = (newTotal: number) => {
    setTotalReceived(newTotal);
    if (!order) return;
    const baseTotal = order.itemsTotal + order.freight;
    const baseCalculated = baseTotal - pixDiscount + cardSurcharge;
    if (newTotal > baseCalculated) {
      setSurcharge(newTotal - baseCalculated);
      setManualDiscount(0);
    } else if (newTotal < baseCalculated) {
      setManualDiscount(baseCalculated - newTotal);
      setSurcharge(0);
    } else {
      setManualDiscount(0);
      setSurcharge(0);
    }
  };

  const handleDiscountChange = (val: number) => {
    setManualDiscount(val);
    if (!order) return;
    const baseTotal = order.itemsTotal + order.freight;
    const amountForFee = baseTotal - val;
    const productDiscount = (order.coupon?.type === 'FREE_SHIPPING') ? 0 : val;
    const baseForPix = Math.max(0, order.itemsTotal - productDiscount);
    
    let newPixDiscount = 0;
    let newCardSurcharge = 0;

    if (paymentMethod === "PIX") {
      const pixRule = settings?.paymentRules?.find((r: any) => r.paymentMethod === "pix" && r.type === "discount");
      if (pixRule && typeof pixRule.value === "number") {
        newPixDiscount = Math.round((baseForPix * (pixRule.value / 100)) * 100) / 100;
      }
    } else if (paymentMethod === "Cartão de Crédito") {
      const activeRule = creditRules.find((r: any) => installments >= (r.parcelaMin || 0) && installments <= (r.parcelaMax || 99));
      if (activeRule && typeof activeRule.value === "number" && activeRule.passedToCustomer !== false) {
        newCardSurcharge = Math.round((amountForFee * (activeRule.value / 100)) * 100) / 100;
      }
    } else if (paymentMethod === "Cartão de Débito") {
      if (debitRule && typeof debitRule.value === "number" && debitRule.passedToCustomer !== false) {
        newCardSurcharge = Math.round((amountForFee * (debitRule.value / 100)) * 100) / 100;
      }
    }

    setPixDiscount(newPixDiscount);
    setCardSurcharge(newCardSurcharge);
    setTotalReceived(Math.round((baseTotal + surcharge + newCardSurcharge - val - newPixDiscount) * 100) / 100);
  };

  const handleSurchargeChange = (val: number) => {
    setSurcharge(val);
    if (!order) return;
    const baseTotal = order.itemsTotal + order.freight;
    setTotalReceived(baseTotal + val + cardSurcharge - manualDiscount - pixDiscount);
  };

  // Regras de parcelamento / cartão vigentes
  const creditRules = settings?.paymentRules?.filter(r => r.paymentMethod === "credit" && r.type === "charge") || [];
  const maxInstallments = creditRules.length > 0 
    ? Math.max(...creditRules.map(r => r.parcelaMax || 12)) 
    : 12;

  const activeRule = creditRules.find(r => installments >= (r.parcelaMin || 0) && installments <= (r.parcelaMax || 99));
  const interestPercentage = activeRule ? activeRule.value : 0;
  const estimatedCardFee = activeRule ? (totalReceived * (activeRule.value / 100)) : 0;

  const debitRule = settings?.paymentRules?.find(r => r.paymentMethod === "debit" && r.type === "charge");
  const debitFeePercentage = debitRule ? debitRule.value : 0;
  const estimatedDebitFee = debitRule ? (totalReceived * (debitRule.value / 100)) : 0;

  const calculatedFee = paymentMethod === "Cartão de Crédito"
    ? estimatedCardFee
    : (paymentMethod === "Cartão de Débito" ? estimatedDebitFee : 0);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (!order || isPaid) return;

    const baseTotal = order.itemsTotal + order.freight;
    let newDiscount = 0;
    let newCardSurcharge = 0;
    const amountForFee = baseTotal - manualDiscount;
    const productDiscount = (order.coupon?.type === 'FREE_SHIPPING') ? 0 : manualDiscount;
    const baseForPix = Math.max(0, order.itemsTotal - productDiscount);

    if (method === "PIX") {
      const pixRule = settings?.paymentRules?.find((r: any) => r.paymentMethod === "pix" && r.type === "discount");
      if (pixRule && typeof pixRule.value === "number") {
        newDiscount = Math.round((baseForPix * (pixRule.value / 100)) * 100) / 100;
      }
    } else if (method === "Cartão de Crédito") {
      const activeRule = creditRules.find((r: any) => installments >= (r.parcelaMin || 0) && installments <= (r.parcelaMax || 99));
      if (activeRule && typeof activeRule.value === "number" && activeRule.passedToCustomer !== false) {
        newCardSurcharge = Math.round((amountForFee * (activeRule.value / 100)) * 100) / 100;
      }
    } else if (method === "Cartão de Débito") {
      if (debitRule && typeof debitRule.value === "number" && debitRule.passedToCustomer !== false) {
        newCardSurcharge = Math.round((amountForFee * (debitRule.value / 100)) * 100) / 100;
      }
    }

    setPixDiscount(newDiscount);
    setCardSurcharge(newCardSurcharge);
    setTotalReceived(Math.round((baseTotal + surcharge + newCardSurcharge - newDiscount - manualDiscount) * 100) / 100);
  };

  const handleInstallmentsChange = (inst: number) => {
    setInstallments(inst);
    if (!order || isPaid) return;

    const baseTotal = order.itemsTotal + order.freight;
    let newCardSurcharge = 0;
    const amountForFee = baseTotal - manualDiscount;

    const activeRule = creditRules.find((r: any) => inst >= (r.parcelaMin || 0) && inst <= (r.parcelaMax || 99));
    if (activeRule && typeof activeRule.value === "number" && activeRule.passedToCustomer !== false) {
      newCardSurcharge = Math.round((amountForFee * (activeRule.value / 100)) * 100) / 100;
    }

    setCardSurcharge(newCardSurcharge);
    setTotalReceived(Math.round((baseTotal + surcharge + newCardSurcharge - pixDiscount - manualDiscount) * 100) / 100);
  };

  const handleReceiveOrder = async () => {
    if (!orderId) return;
    try {
      const derivedPaymentType = paymentMethod === "PIX" ? "Online" : "Na Entrega";

      await receiveMutation.mutateAsync({
        id: orderId,
        payload: {
          paymentMethod,
          paymentType: derivedPaymentType,
          discount: manualDiscount,
          pixDiscount,
          surcharge,
          cardSurcharge,
          totalReceived,
          installments: paymentMethod === "Cartão de Crédito" ? installments : 1,
          cardFee: calculatedFee,
        }
      });
      toast({
        title: "Sucesso",
        description: "Pagamento recebido e pedido atualizado.",
      });
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao processar o recebimento.",
      });
    }
  };

  const handleRevertReceiveOrder = async () => {
    if (!orderId) return;
    try {
      await revertReceiveMutation.mutateAsync(orderId);
      toast({
        title: "Sucesso",
        description: "Recebimento revertido.",
      });
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao reverter o recebimento.",
      });
    }
  };

  const handleCopyAddress = () => {
    if (!order) return;
    const addressStr = `${order.street}, ${order.number}`;
    
    navigator.clipboard.writeText(addressStr);
    setCopied(true);
    toast({
      title: "Endereço copiado!",
      description: "Endereço formatado foi copiado para a área de transferência.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyName = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.customerName);
    setCopiedName(true);
    toast({ title: "Nome copiado!" });
    setTimeout(() => setCopiedName(false), 2000);
  };

  const handleCopyPhone = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.customerPhone);
    setCopiedPhone(true);
    toast({ title: "Telefone copiado!" });
    setTimeout(() => setCopiedPhone(false), 2000);
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
      <DialogContent hideCloseButton className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl h-[90vh] overflow-hidden bg-white p-0 border border-slate-200 shadow-2xl flex flex-col rounded-2xl">
        <DialogTitle className="sr-only">Detalhes do Pedido</DialogTitle>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm text-slate-500 font-medium animate-pulse">Carregando detalhes do pedido...</p>
          </div>
        ) : order ? (
          <div className="flex flex-col h-full">
            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <Select 
                    value={localStatus || order.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className={`w-32 h-7 text-xs font-bold rounded-full border-0 focus:ring-0 ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="CONFIRMED">Separado</SelectItem>
                      <SelectItem value="DISPATCHED">Enviado</SelectItem>
                      <SelectItem value="COMPLETED">Entregue</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-slate-700">{order.customerName}</div>
                        <button onClick={handleCopyName} className="text-slate-400 hover:text-violet-600 transition-colors" title="Copiar Nome">
                          {copiedName ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a 
                          href={`tel:${order.customerPhone}`}
                          className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1 font-medium"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                        <button onClick={handleCopyPhone} className="text-slate-400 hover:text-violet-600 transition-colors" title="Copiar Telefone">
                          {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product items section */}
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Itens do Pedido</div>
                <div className="space-y-3 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm max-h-[220px] overflow-y-auto">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 relative">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200/50">
                        {item.imageUrl ? (
                          <img
                            src={buildImageUrl(item.imageUrl)}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <span className="text-[10px] text-slate-400 font-medium text-center leading-none px-1">Sem foto</span>
                          </div>
                        )}
                        {/* Quantity Badge */}
                        <div className="absolute -top-1.5 -left-1.5 min-w-[35px] h-[35px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[15px] font-bold px-1 shadow-sm z-10">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Product Name and Price */}
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <div className="truncate pr-2 max-w-[60%]">
                          <span className="text-sm font-bold text-slate-700 leading-tight">{item.productName}</span>
                          {item.variation && (
                            <span className="block text-xs text-slate-400 font-medium truncate mt-0.5">({item.variation})</span>
                          )}
                        </div>
                        <div className="flex-1 border-b border-dashed border-slate-200 mx-2" />
                        <span className="text-sm font-bold text-slate-700 shrink-0">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial values summary calculations */}
              <div className="space-y-2.5 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm text-sm font-medium">
                <div className="flex justify-between text-slate-500 items-center">
                  <span>Total dos itens ({order.items.length})</span>
                  <span>R$ {order.itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 items-center">
                  <span>Frete</span>
                  <span>R$ {order.freight.toFixed(2)}</span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between text-violet-600 font-bold items-center bg-violet-50/30 px-1 py-0.5 rounded border border-violet-100">
                    <span>Cupom Aplicado</span>
                    <span className="bg-violet-600 text-white px-2 py-0.5 rounded text-[10px] uppercase">{order.coupon.title}</span>
                  </div>
                )}
                {paymentMethod === "Cartão de Crédito" && cardSurcharge > 0 && (
                  <div className="flex justify-between text-violet-600 font-bold items-center bg-violet-50/30 px-1 py-0.5 rounded">
                    <span>Juros Crédito ({installments}x)</span>
                    <span>R$ {cardSurcharge.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === "Cartão de Débito" && cardSurcharge > 0 && (
                  <div className="flex justify-between text-violet-600 font-bold items-center bg-violet-50/30 px-1 py-0.5 rounded">
                    <span>Taxa Débito</span>
                    <span>R$ {cardSurcharge.toFixed(2)}</span>
                  </div>
                )}
                {paymentMethod === "PIX" && pixDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold items-center bg-emerald-50/30 px-1 py-0.5 rounded">
                    <span>Desconto PIX</span>
                    <span>- R$ {pixDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 items-center">
                  <span>Desconto Recebimento</span>
                  {isPaid ? (
                    <span className="font-semibold text-slate-700 pr-1">R$ {manualDiscount.toFixed(2)}</span>
                  ) : (
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        className="h-8 text-right bg-background pl-8 pr-3 text-sm rounded-lg font-medium"
                        value={manualDiscount !== undefined ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(manualDiscount) : ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          handleDiscountChange(Number(digits) / 100);
                        }}
                        disabled={order.status === "COMPLETED" || order.status === "CANCELLED"}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-slate-500 items-center">
                  <span>Acréscimo Recebimento</span>
                  {isPaid ? (
                    <span className="font-semibold text-slate-700 pr-1">R$ {surcharge.toFixed(2)}</span>
                  ) : (
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        className="h-8 text-right bg-background pl-8 pr-3 text-sm rounded-lg"
                        value={surcharge !== undefined ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(surcharge) : ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          handleSurchargeChange(Number(digits) / 100);
                        }}
                        disabled={order.status === "COMPLETED" || order.status === "CANCELLED"}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2.5 items-center">
                  <span>Total final</span>
                  <span>R$ {((order.itemsTotal || 0) + (order.freight || 0) + surcharge + cardSurcharge - manualDiscount - pixDiscount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 bg-emerald-50/50 p-2 rounded-lg mt-1 items-center">
                  <span>Total recebido</span>
                  {isPaid ? (
                    <span className="font-bold text-emerald-700 pr-1">R$ {totalReceived.toFixed(2)}</span>
                  ) : (
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-emerald-600">R$</span>
                      <Input
                        className="h-8 text-right bg-white pl-8 pr-3 font-bold text-emerald-700 border-emerald-200 focus-visible:ring-emerald-500 rounded-lg text-sm"
                        value={totalReceived !== undefined ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalReceived) : ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          handleTotalChange(Number(digits) / 100);
                        }}
                        disabled={order.status === "COMPLETED" || order.status === "CANCELLED"}
                      />
                    </div>
                  )}
                </div>
              </div>


              {/* Payment Section */}
              <div className="space-y-2.5 bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Pagamento</span>
                  <span className="text-slate-800 font-bold">
                    {isPaid ? order.paymentType : (paymentMethod === "PIX" ? "Online" : "Na Entrega")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 items-center">
                  <span>Forma de pagamento</span>
                  {isPaid ? (
                    <span className="font-bold text-slate-800">{paymentMethod || "-"}</span>
                  ) : (
                    <Select 
                      value={paymentMethod} 
                      onValueChange={handlePaymentMethodChange} 
                      disabled={order.status === "COMPLETED" || order.status === "CANCELLED"}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs font-bold rounded-lg border-slate-200 bg-slate-50">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(paymentLabels).map(k => (
                          <SelectItem key={k} value={k}>{paymentLabels[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {paymentMethod === "Cartão de Crédito" && !isPaid && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
                    <div className="flex justify-between text-slate-500 items-center">
                      <span>Parcelas</span>
                      <Select 
                        value={installments.toString()} 
                        onValueChange={(val) => handleInstallmentsChange(Number(val))} 
                        disabled={order.status === "COMPLETED" || order.status === "CANCELLED"}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs font-bold rounded-lg border-slate-200 bg-slate-50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(maxInstallments)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {activeRule && (
                      <div className="text-right text-[11px] text-violet-600 font-bold bg-violet-50/70 px-2.5 py-1 rounded-md mt-0.5 border border-violet-100/50">
                        Taxa estimada (Juros): R$ {estimatedCardFee.toFixed(2)} ({interestPercentage.toFixed(2)}%)
                      </div>
                    )}
                  </div>
                )}
                {paymentMethod === "Cartão de Débito" && !isPaid && debitRule && (
                  <div className="text-right text-[11px] text-violet-600 font-bold bg-violet-50/70 px-2.5 py-1 rounded-md mt-0.5 border border-violet-100/50">
                    Taxa estimada (Débito): R$ {estimatedDebitFee.toFixed(2)} ({debitFeePercentage.toFixed(2)}%)
                  </div>
                )}
                {isPaid && order.installments && order.paymentMethod === "Cartão de Crédito" && (
                  <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-2">
                    <span>Parcelas pagas</span>
                    <span className="text-slate-800 font-bold">{order.installments}x</span>
                  </div>
                )}
                {isPaid && order.cardFee !== undefined && order.cardFee > 0 && (
                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Taxa de Cartão Retida</span>
                      <span className="text-rose-600 font-bold">R$ {order.cardFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-semibold text-xs border-t border-dashed border-slate-100 pt-1">
                      <span>Receita Líquida</span>
                      <span className="text-emerald-600 font-bold">R$ {(order.totalReceived - order.cardFee).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {order.pixKey && !(order.paymentType.toLowerCase().includes("na entrega") && paymentMethod !== "PIX") && (
                  <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-2">
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
            <div className="flex items-center gap-3 p-6 border-t border-slate-200/80 bg-slate-50 shrink-0">
              {order.status !== "CANCELLED" ? (
                order.paymentStatus === "PAID" ? (
                  <Button 
                    variant="destructive"
                    className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-rose-100"
                    disabled={revertReceiveMutation.isPending}
                    onClick={handleRevertReceiveOrder}
                  >
                    {revertReceiveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <span>Cancelar Recebimento</span>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="default"
                      className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-emerald-100"
                      disabled={receiveMutation.isPending}
                      onClick={handleReceiveOrder}
                    >
                      {receiveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <span>Receber Pagamento</span>
                      )}
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-rose-100"
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
                  </>
                )
              ) : null}
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-11 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-all"
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
