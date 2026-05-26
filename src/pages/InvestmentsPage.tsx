import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInvestmentSummary, useInvestmentTransactions } from "@/hooks/useInvestments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Minus, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddInvestmentModal } from "@/components/investments/AddInvestmentModal";
import { RegisterPurchaseModal } from "@/components/investments/RegisterPurchaseModal";

export default function InvestmentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const { data: summary, isLoading: isLoadingSummary } = useInvestmentSummary();
  const { data: transactions, isLoading: isLoadingTransactions } = useInvestmentTransactions();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-violet-600" />
            Módulo de Investimento
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gerencie o capital destinado a compras de fornecedores.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Capital
          </Button>
          <Button onClick={() => setIsPurchaseModalOpen(true)} variant="destructive" className="w-full sm:w-auto">
            <Minus className="mr-2 h-4 w-4" />
            Registrar Compra
          </Button>
        </div>
      </div>

      {isLoadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`border-l-4 ${summary && summary.totalBalance < 0 ? "border-l-rose-500" : "border-l-violet-500"} shadow-sm`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${summary && summary.totalBalance < 0 ? "text-rose-600" : "text-violet-600"}`}>
                {summary ? formatCurrency(summary.totalBalance) : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Investido (Entradas)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {summary ? formatCurrency(summary.totalEntries) : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Gasto com Produtos (Saídas)</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {summary ? formatCurrency(summary.totalOutflows) : "R$ 0,00"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600">Data e Hora</TableHead>
                    <TableHead className="font-semibold text-slate-600">Descrição</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Tipo</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-slate-500">
                        {format(new Date(tx.createdAt), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tx.type === "ENTRY" ? "default" : "destructive"}
                          className={tx.type === "ENTRY" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none" : "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 shadow-none"}
                        >
                          {tx.type === "ENTRY" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${tx.type === "ENTRY" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "ENTRY" ? "+" : "-"} {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">Nenhuma transação encontrada no módulo de investimento.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <RegisterPurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} />
    </div>
  );
}
