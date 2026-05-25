import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Landmark, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [txType, setTxType] = useState<"ENTRY" | "OUTFLOW">("ENTRY");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");

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
      }),
    onSuccess: () => {
      toast({
        title: "Lançamento efetuado!",
        description: "Movimentação manual registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["cash-register-summary", id] });
      setIsTxOpen(false);
      setTxAmount("");
      setTxDescription("");
    },
    onError: (err: any) => {
      toast({
        title: "Erro no lançamento",
        description: err?.message || "Ocorreu um erro ao salvar o registro.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div className="p-8">Carregando relatório...</div>;
  if (!data) return <div className="p-8">Caixa não encontrado.</div>;

  const { cashRegister, summary, orders, transactions = [] } = data;

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

      {/* Grid Estatístico Premium com 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <Card className="border-emerald-100 bg-emerald-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Faturamento Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">
              {currencyFormatter.format(summary.totalGross || summary.totalReceived)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-green-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-green-800 font-bold">Entradas Manuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-600">
              {currencyFormatter.format(summary.totalEntries || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-100 bg-amber-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-amber-800 font-bold">Taxas Retidas (Cartão)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">
              {currencyFormatter.format(summary.totalCardFees || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-rose-800 font-bold">Saídas / Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-rose-600">
              {currencyFormatter.format(summary.totalOutflows || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-100 bg-violet-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-violet-800 font-bold">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-violet-600">
              {currencyFormatter.format(summary.totalNet !== undefined ? summary.totalNet : summary.totalReceived)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Operacional: Tabela de Pedidos + Resumo por Método */}
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
                    {order.paymentMethod || "-"}
                    {order.paymentMethod === "Cartão de Crédito" && order.installments && (
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
                  <span className="text-sm font-semibold text-slate-600">{method}</span>
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

      {/* Extrato Detalhado de Caixa (Manual + Custos Fixos) */}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx: any) => (
              <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="text-slate-500 text-xs">
                  {format(new Date(tx.date || tx.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="font-medium text-slate-700">{tx.description}</TableCell>
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
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhuma movimentação manual ou pagamento de custo fixo registrado neste caixa.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tx-amount" className="font-semibold text-gray-700">Valor (R$)</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="0.00"
                required
              />
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
