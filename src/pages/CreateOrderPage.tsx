import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSearch } from "@/components/orders/ProductSearch";
import { CustomerSearch } from "@/components/orders/CustomerSearch";
import { OrderSummary } from "@/components/orders/OrderSummary";
import type { ProductResponse } from "@/types/product";
import type { Customer, CustomerAddress } from "@/services/customers.service";
import type { Coupon } from "@/services/coupon.service";
import { createOrder } from "@/services/order.service";
import { useToast } from "@/components/ui/use-toast";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = coupon ? (coupon.type === "VALUE" ? (coupon.value || 0) : coupon.type === "PERCENTAGE" ? subtotal * ((coupon.value || 0) / 100) : 0) : 0;
  const total = Math.max(0, subtotal - discount);
  const isValid = selectedCustomer !== null && orderItems.length > 0 && paymentMethod !== "";

  const handleSubmit = async () => {
    if (!isValid || !selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await createOrder({
        customerId: selectedCustomer.id,
        items: orderItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddressId: selectedAddress?.id,
        couponCode: coupon?.title,
        paymentMethod,
        paymentStatus: isPaid ? "PAID" : "PENDING"
      });
      toast({
        title: "Pedido criado com sucesso!",
        description: "O novo pedido já está disponível na lista."
      });
      navigate("/pedidos");
    } catch (error) {
      toast({
        title: "Erro ao criar pedido",
        description: "Tente novamente ou verifique os dados.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = (product: ProductResponse) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.promotionalPrice || product.price || 0,
          quantity: 1,
        }
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setOrderItems((prev) => 
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/pedidos")}
          className="rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Novo Pedido</h1>
          <p className="text-sm text-slate-500 font-medium">Crie um pedido manualmente selecionando produtos e cliente.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Products and Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Search Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Cliente</h2>
            <CustomerSearch 
              onSelectCustomer={setSelectedCustomer} 
              onSelectAddress={setSelectedAddress} 
            />
          </div>

          {/* Product Search Section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Produtos</h2>
            <ProductSearch onSelectProduct={handleAddProduct} />
            
            {orderItems.length > 0 && (
              <div className="mt-6 space-y-3">
                {orderItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-slate-700 text-sm">{item.title}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-slate-700 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-md"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7 rounded-md"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                        onClick={() => handleRemoveProduct(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary and Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Resumo do Pedido</h2>
            <OrderSummary 
              subtotal={subtotal}
              discount={discount}
              total={total}
              coupon={coupon}
              onApplyCoupon={setCoupon}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              isPaid={isPaid}
              onIsPaidChange={setIsPaid}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isValid={isValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
