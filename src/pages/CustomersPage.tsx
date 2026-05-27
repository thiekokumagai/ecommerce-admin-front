import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Users, ArrowRight, X } from "lucide-react";
import CustomerDetailDrawer from "@/components/CustomerDetailDrawer";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: paginatedData, isLoading } = useCustomers(search, page, limit);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const customers = paginatedData?.data || [];
  const meta = paginatedData?.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Clientes</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gerencie sua base de clientes, visualize históricos e dados de contato.
          </p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 h-11 border-slate-200 focus-visible:ring-violet-600 rounded-xl font-medium placeholder:text-slate-400"
          />
        </div>
        
        {search && (
          <Button 
            variant="ghost" 
            onClick={() => { setSearch(""); setPage(1); }} 
            className="h-11 px-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors sm:ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Main Panel */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white/40 border border-slate-200/50 rounded-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-sm font-semibold text-slate-500">Carregando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/70 border border-slate-200/50 rounded-2xl text-center p-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-lg">Nenhum cliente encontrado</h3>
            <p className="text-xs text-slate-400 max-w-xs font-medium">Tente buscar por outro nome ou número de telefone.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-600 pl-6">Nome</TableHead>
                <TableHead className="font-bold text-slate-600">Telefone</TableHead>
                <TableHead className="font-bold text-slate-600">Cadastro</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className="group cursor-pointer hover:bg-violet-50/40 transition-colors"
                >
                  <TableCell className="pl-6">
                    <div className="font-bold text-slate-700">{customer.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-500 font-mono tracking-tight">{customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-500">
                      {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Mostrando página {meta.page} de {meta.totalPages} ({meta.total} {meta.total === 1 ? 'cliente' : 'clientes'})
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="h-8 rounded-lg font-bold text-xs border-slate-200 text-slate-600"
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={meta.page === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-lg font-bold text-xs p-0 border-slate-200 ${
                        meta.page === p 
                          ? "bg-violet-600 hover:bg-violet-700 text-white" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="h-8 rounded-lg font-bold text-xs border-slate-200 text-slate-600"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Details Drawer */}
      <CustomerDetailDrawer 
        customerId={selectedCustomerId} 
        isOpen={!!selectedCustomerId} 
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}
