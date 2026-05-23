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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(summary.totalReceived)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Qtd. Pedidos Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Método</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(summary.totalsByMethod).map(([method, total]) => (
                <div key={method} className="flex justify-between">
                  <span>{method}</span>
                  <span className="font-semibold">
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

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-semibold">Pedidos Incluídos neste Caixa</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {order.paymentDate
                    ? format(new Date(order.paymentDate), "dd/MM/yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell>{order.paymentMethod || "-"}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(order.totalReceived)}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum pedido pago neste período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
