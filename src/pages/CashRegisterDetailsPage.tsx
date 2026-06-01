import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Landmark, Plus, ArrowUpRight, ArrowDownRight, Trash2, ShoppingBag, TrendingUp, Calendar, Package } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cashRegisterService } from "@/services/cash-register.service";
import { fixedCostService } from "@/services/fixed-cost.service";

export default function CashRegisterDetailsPage({ currentId }: { currentId?: string }) {
  const { id: paramId } = useParams();
  const id = currentId || paramId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isTxOpen, setIsTxOpen] = useState(false);
  const [txType, setTxType] = useState<"ENTRY" | "OUTFLOW">("OUTFLOW");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txCategory, setTxCategory] = useState<"GENERAL" | "MOTOBOY">("MOTOBOY");

  const { data, isLoading } = useQuery({
    queryKey: ["cash-register-summary", id],
    queryFn: () => cashRegisterService.getSummary(id!),
    enabled: !!id,
  });

  const txMutation = useMutation({
    mutationFn: () =>
      fixedCostService.createManualTransaction(id!, {
        type: txType,
        amount: parseFloat(txAmount),
        description: txDescription,
        category: txCategory,
      } as any),
    onSuccess: () => {
      toast({
        title: "Lançamento efetuado!",
        description: "Movimentação manual registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["cash-register-summary", id] });
      setIsTxOpen(false);
      setTxAmount("");
      setTxDescription("");
      setTxType("OUTFLOW");
      setTxCategory("MOTOBOY");
    },
    onError: (err: any) => {
      toast({
        title: "Erro no lançamento",
        description: err?.message || "Ocorreu um erro ao salvar o registro.",
        variant: "destructive",
      });
    },
  });

  const deleteTxMutation = useMutation({
    mutationFn: (txId: string) => fixedCostService.deleteTransaction(txId),
    onSuccess: () => {
      toast({
        title: "Movimentação excluída",
        description: "A movimentação manual foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["cash-register-summary", id] });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao excluir",
        description: err?.message || "Ocorreu um erro ao remover a movimentação.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div className="p-8">Carregando relatório...</div>;
  if (!data) return <div className="p-8">Caixa não encontrado.</div>;

  const { cashRegister, summary, orders, transactions = [] } = data;

  const handleDeleteTx = (txId: string) => {
    if (confirm("Tem certeza que deseja excluir esta movimentação? Essa ação não pode ser desfeita e os valores retornarão ao caixa.")) {
      deleteTxMutation.mutate(txId);
    }
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor acima de zero.",
        variant: "destructive",
      });
      return;
    }
    txMutation.mutate();
  };

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Calculations for additional metrics
  const totalPedidosPeriodo = orders.length;
  const ticketMedio = totalPedidosPeriodo > 0 ? (summary.totalReceived / totalPedidosPeriodo) : 0;

  // Compute using local timezone America/Campo_Grande
  const nowLocal = new Date().toLocaleString("en-US", { timeZone: "America/Campo_Grande" });
  const todayLocal = new Date(nowLocal);
  const todayStart = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate(), 23, 59, 59, 999);

  const ordersToday = orders.filter((order: any) => {
    if (!order.paymentDate) return false;
    const paymentDate = new Date(new Date(order.paymentDate).toLocaleString("en-US", { timeZone: "America/Campo_Grande" }));
    return paymentDate >= todayStart && paymentDate <= todayEnd;
  });

  const totalVendasDia = ordersToday.reduce((acc: number, order: any) => acc + (order.totalReceived || 0), 0);
  const produtosVendidosDia = ordersToday.reduce((acc: number, order: any) => {
    const itemsQty = order.items?.reduce((itemAcc: number, item: any) => itemAcc + (item.quantity || 0), 0) || 0;
    return acc + itemsQty;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/caixa">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Landmark className="h-7 w-7 text-primary" />
              {cashRegister.title}
            </h1>
            <p className="text-gray-500">
              {format(new Date(cashRegister.startDate), "dd/MM/yyyy")} até{" "}
              {format(new Date(cashRegister.endDate), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        {/* Botão de movimentação manual apenas se for o caixa ativo / atual */}
        {currentId && (
          <Button onClick={() => setIsTxOpen(true)} className="gap-2 font-semibold">
            <Plus className="h-5 w-5" />
            Lançar Movimentação
          </Button>
        )}
      </div>

      {/* Grupo 1: Fluxo de Caixa (Financeiro) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Fluxo de Caixa & Saldos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-emerald-100 bg-emerald-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Faturamento Bruto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-emerald-600">
                {currencyFormatter.format(summary.totalGross || summary.totalReceived)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-green-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-green-800 font-bold">Entradas Manuais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-green-600">
                {currencyFormatter.format(summary.totalEntries || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-amber-100 bg-amber-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-amber-800 font-bold">Taxas Retidas (Cartão)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-amber-600">
                {currencyFormatter.format(summary.totalCardFees || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-rose-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-rose-800 font-bold">Saídas / Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-rose-600">
                {currencyFormatter.format(summary.totalOutflows || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-orange-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-orange-800 font-bold">Gasto Motoboy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-orange-600">
                {currencyFormatter.format(summary.motoboyOutflows || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-violet-50/10 rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-violet-800 font-bold">Saldo Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-violet-600">
                {currencyFormatter.format(summary.totalNet !== undefined ? summary.totalNet : summary.totalReceived)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grupo 2: Indicadores de Desempenho e Vendas do Dia */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Indicadores do Período & Vendas de Hoje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-slate-50/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl text-emerald-600 bg-emerald-50">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Vendas Hoje</p>
                <p className="text-2xl font-black text-slate-800">
                  {currencyFormatter.format(totalVendasDia)}
                </p>
              </div>
            </CardContent>
          </Card>          
          <Card className="border-slate-200 bg-slate-50/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl text-sky-600 bg-sky-50">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pedidos Hoje</p>
                <p className="text-2xl font-black text-slate-800">{ordersToday.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl text-teal-600 bg-teal-50">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Ticket Médio</p>
                <p className="text-2xl font-black text-slate-800">
                  {currencyFormatter.format(ticketMedio)}
                </p>
              </div>
            </CardContent>
          </Card>

          

          <Card className="border-slate-200 bg-slate-50/20 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl text-amber-600 bg-amber-50">
                <Package className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Itens Vendidos Hoje</p>
                <p className="text-2xl font-black text-slate-800">{produtosVendidosDia}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="mb-6 bg-slate-100 p-1">
          <TabsTrigger value="pedidos" className="font-semibold">Pedidos Recebidos</TabsTrigger>
          <TabsTrigger value="movimentacoes" className="font-semibold">Movimentações Manuais</TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="animate-in fade-in duration-300 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Tabela de Pedidos */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Pedidos Incluídos neste Caixa</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="w-24">Nº Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right text-rose-700">Taxa</TableHead>
                    <TableHead className="text-right text-emerald-700">Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900">#{order.orderNumber}</TableCell>
                      <TableCell className="font-medium text-slate-700">{order.customerName}</TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {order.paymentDate
                          ? format(new Date(order.paymentDate), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-bold text-slate-600 text-xs">
                        {
                          (order.paymentMethod === 'pix' || order.paymentMethod === 'PIX') ? 'Pix' :
                          (order.paymentMethod === 'credito' || order.paymentMethod === 'credit' || order.paymentMethod === 'Cartão de Crédito') ? 'Cartão de Crédito' :
                          (order.paymentMethod === 'debito' || order.paymentMethod === 'debit' || order.paymentMethod === 'Cartão de Débito') ? 'Cartão de Débito' :
                          (order.paymentMethod === 'dinheiro' || order.paymentMethod === 'cash' || order.paymentMethod === 'Dinheiro') ? 'Dinheiro' :
                          order.paymentMethod || "-"
                        }
                        {(order.paymentMethod === "Cartão de Crédito" || order.paymentMethod === "credito" || order.paymentMethod === "credit") && order.installments && (
                          <span className="text-slate-400 font-normal text-[11px] ml-1">({order.installments}x)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {currencyFormatter.format(order.totalReceived)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-rose-500">
                        {order.cardFee ? currencyFormatter.format(order.cardFee) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-black text-emerald-600">
                        {currencyFormatter.format(order.totalReceived - (order.cardFee || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum pedido pago neste período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Resumo por Método */}
            <Card className="lg:col-span-1 border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b py-4">
                <CardTitle className="text-base font-bold text-slate-700">Por Método de Venda</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3.5">
                  {Object.entries(summary.totalsByMethod).map(([method, total]) => (
                    <div key={method} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-sm font-semibold text-slate-600">{
                          (method === 'pix' || method === 'PIX') ? 'Pix' :
                          (method === 'credito' || method === 'credit' || method === 'Cartão de Crédito') ? 'Cartão de Crédito' :
                          (method === 'debito' || method === 'debit' || method === 'Cartão de Débito') ? 'Cartão de Débito' :
                          (method === 'dinheiro' || method === 'cash' || method === 'Dinheiro') ? 'Dinheiro' :
                          method
                      }</span>
                      <span className="font-extrabold text-slate-800">
                        {currencyFormatter.format(total as number)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(summary.totalsByMethod).length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-xs">Sem vendas consolidadas.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes" className="animate-in fade-in duration-300 focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Movimentações Manuais & Saídas de Caixa</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30">
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-500 text-xs">
                      {format(new Date(tx.date || tx.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {tx.description}
                      {tx.category === "MOTOBOY" && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          Motoboy
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tx.type === "ENTRY" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-100">
                          <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                          Saída
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-black ${tx.type === "ENTRY" ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.type === "ENTRY" ? "+" : "-"} {currencyFormatter.format(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTx(tx.id)}
                          disabled={deleteTxMutation.isPending}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma movimentação manual ou pagamento de custo fixo registrado neste caixa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Registro de Movimentação Manual */}
      <Dialog open={isTxOpen} onOpenChange={setIsTxOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Lançar Movimentação Manual
            </DialogTitle>
            <DialogDescription>
              Insira uma entrada ou saída de caixa manual neste período vigente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTxSubmit} className="space-y-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tx-type" className="font-semibold text-gray-700">Tipo de Movimento</Label>
              <Select
                value={txType}
                onValueChange={(val: any) => setTxType(val)}
              >
                <SelectTrigger id="tx-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY">Entrada (+)</SelectItem>
                  <SelectItem value="OUTFLOW">Saída (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {txType === "OUTFLOW" && (
              <div className="flex flex-col space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="tx-category" className="font-semibold text-gray-700">Categoria da Saída</Label>
                <Select
                  value={txCategory}
                  onValueChange={(val: any) => setTxCategory(val)}
                >
                  <SelectTrigger id="tx-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">Geral</SelectItem>
                    <SelectItem value="MOTOBOY">Motoboy / Frete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tx-amount" className="font-semibold text-gray-700">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                <Input
                  id="tx-amount"
                  value={txAmount !== "" ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(txAmount)) : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setTxAmount(digits ? (Number(digits) / 100).toString() : "");
                  }}
                  className="pl-9"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tx-desc" className="font-semibold text-gray-700">Descrição / Motivo</Label>
              <Input
                id="tx-desc"
                type="text"
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="Ex: Suprimento, Sangria, Troco"
                required
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsTxOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={txMutation.isPending}>
                {txMutation.isPending ? "Gravando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
