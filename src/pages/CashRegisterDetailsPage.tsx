import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
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
import { cashRegisterService } from "@/services/cash-register.service";

export default function CashRegisterDetailsPage({ currentId }: { currentId?: string }) {
  const { id: paramId } = useParams();
  const id = currentId || paramId;

  const { data, isLoading } = useQuery({
    queryKey: ["cash-register-summary", id],
    queryFn: () => cashRegisterService.getSummary(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8">Carregando relatório...</div>;
  if (!data) return <div className="p-8">Caixa não encontrado.</div>;

  const { cashRegister, summary, orders } = data;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/caixa">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{cashRegister.title}</h1>
          <p className="text-gray-500">
            {format(new Date(cashRegister.startDate), "dd/MM/yyyy")} até{" "}
            {format(new Date(cashRegister.endDate), "dd/MM/yyyy")}
          </p>
        </div>
      </div>

      {/* Grid Estatístico Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-emerald-100 bg-emerald-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-emerald-800 font-bold">Faturamento Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(summary.totalGross || summary.totalReceived)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-rose-100 bg-rose-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-rose-800 font-bold">Taxas Retidas (Cartão)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-rose-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(summary.totalCardFees || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-100 bg-violet-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-violet-800 font-bold">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-violet-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(summary.totalNet !== undefined ? summary.totalNet : summary.totalReceived)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">Pedidos Recebidos</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-baseline">
            <p className="text-3xl font-bold text-slate-700">{summary.orderCount}</p>
            <span className="text-xs text-slate-400 font-medium">pedidos finalizados</span>
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
              {orders.map((order) => (
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
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.totalReceived)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-rose-500">
                    {order.cardFee ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.cardFee) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-black text-emerald-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.totalReceived - (order.cardFee || 0))}
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
            <CardTitle className="text-base font-bold text-slate-700">Por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5">
              {Object.entries(summary.totalsByMethod).map(([method, total]) => (
                <div key={method} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-slate-600">{method}</span>
                  <span className="font-extrabold text-slate-800">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(total)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
