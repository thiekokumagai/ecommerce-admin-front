import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const CustomersPage = lazy(() => import("@/pages/CustomersPage"));
const ProductDetailsPage = lazy(() => import("@/pages/ProductDetailsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const CouponsPage = lazy(() => import("@/pages/CouponsPage"));
// DeliveriesPage and PaymentsPage removed — content merged into /configuracoes
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CashRegistersPage = lazy(() => import("@/pages/CashRegistersPage"));
const CashRegisterDetailsPage = lazy(() => import("@/pages/CashRegisterDetailsPage"));
const CurrentCashRegisterPage = lazy(() => import("@/pages/CurrentCashRegisterPage"));
const CustosFixosPage = lazy(() => import("@/pages/CustosFixosPage"));
const InvestmentsPage = lazy(() => import("@/pages/InvestmentsPage"));
const VariationPage = lazy(() => import("@/pages/VariationPage"));
const VariationDetailsPage = lazy(() => import("@/pages/VariationDetailsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OrderPrintPage = lazy(() => import("@/pages/OrderPrintPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true" aria-label="Carregando">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/pedidos/:id/imprimir" element={<OrderPrintPage />} />
              <Route element={<AdminLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pedidos" element={<OrdersPage />} />
                <Route path="/clientes" element={<CustomersPage />} />
                <Route path="/produtos" element={<ProductsPage />} />
                <Route path="/produtos/:id" element={<ProductDetailsPage />} />
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/cupons" element={<CouponsPage />} />
                <Route path="/entregas" element={<Navigate to="/configuracoes" replace />} />
                <Route path="/pagamentos" element={<Navigate to="/configuracoes" replace />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
                <Route path="/caixa" element={<CashRegistersPage />} />
                <Route path="/caixa/:id" element={<CashRegisterDetailsPage />} />
                <Route path="/financeiro/atual" element={<CurrentCashRegisterPage />} />
                <Route path="/financeiro/custos-fixos" element={<CustosFixosPage />} />
                <Route path="/investimentos" element={<InvestmentsPage />} />
                <Route path="/variacoes" element={<VariationPage />} />
                <Route path="/variacoes/:id" element={<VariationDetailsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;