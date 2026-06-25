import { useState } from "react";
import { CreditCard, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCoupons } from "@/hooks/useCoupons";
import type { Coupon } from "@/services/coupon.service";
import { useToast } from "@/components/ui/use-toast";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  isPaid: boolean;
  onIsPaidChange: (val: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function OrderSummary({
  subtotal,
  discount,
  total,
  coupon,
  onApplyCoupon,
  paymentMethod,
  onPaymentMethodChange,
  isPaid,
  onIsPaidChange,
  onSubmit,
  isSubmitting,
  isValid
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const { data: coupons } = useCoupons();
  const { toast } = useToast();

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      onApplyCoupon(null);
      return;
    }

    const found = coupons?.find(c => c.title.toUpperCase() === couponCode.trim().toUpperCase() && c.status);
    if (found) {
      if (found.minOrderValue && subtotal < found.minOrderValue) {
        toast({
          title: "Cupom inválido",
          description: `O valor mínimo para este cupom é ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(found.minOrderValue)}`,
          variant: "destructive"
        });
        return;
      }
      onApplyCoupon(found);
      toast({
        title: "Cupom aplicado!",
        description: "Desconto adicionado ao pedido."
      });
    } else {
      toast({
        title: "Cupom não encontrado",
        description: "Verifique o código e tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Coupon */}
      <div className="space-y-3">
        <Label className="text-slate-700 font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" /> Cupom de Desconto
        </Label>
        <div className="flex gap-2">
          <Input 
            placeholder="Código do cupom" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="h-10 uppercase"
          />
          <Button 
            variant="outline" 
            className="h-10 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            onClick={handleApplyCoupon}
          >
            Aplicar
          </Button>
        </div>
        {coupon && (
          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-100 flex items-center justify-between">
            <span>Cupom {coupon.title} aplicado!</span>
            <button onClick={() => { setCouponCode(""); onApplyCoupon(null); }} className="text-slate-400 hover:text-slate-600">
              Remover
            </button>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Payment Method */}
      <div className="space-y-3">
        <Label className="text-slate-700 font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Forma de Pagamento
        </Label>
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIX">Pix</SelectItem>
            <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
            <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <Label htmlFor="is-paid" className="text-slate-700 font-bold cursor-pointer">Pedido já está pago?</Label>
        <Switch 
          id="is-paid" 
          checked={isPaid}
          onCheckedChange={onIsPaidChange}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      <hr className="border-slate-100" />

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Subtotal</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Desconto</span>
            <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-slate-800 font-black text-xl pt-3 border-t border-slate-100">
          <span>Total</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
        </div>
      </div>

      <Button 
        className="w-full h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
        disabled={!isValid || isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Finalizando..." : "Finalizar Pedido"}
      </Button>
    </div>
  );
}
