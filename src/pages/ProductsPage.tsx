import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductListTable, ProductListTableFilters } from "@/components/products/ProductListTable";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PageLoader } from "@/components/common/PageLoader";
import {
  deleteProduct,
  getProductItems,
  updateProductItem,
  updateProduct,
  duplicateProduct,
} from "@/services/product.service";

const PAGE_SIZE = 30;

export default function ProductsPage() {
  const queryClient = useQueryClient();

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductListTableFilters>({
    search: "",
    status: "all",
    categoryId: "",
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset page when filters change
  const handleFiltersChange = (next: ProductListTableFilters) => {
    setFilters(next);
    setPage(1);
    setSelectedIds([]);
  };

  const productsQuery = useProducts({
    page,
    limit: PAGE_SIZE,
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
  });
  const categoriesQuery = useCategories();

  const rawProducts = productsQuery.data?.products ?? [];
  const meta = productsQuery.data?.meta;

  // Client-side status filter (API doesn't support it yet)
  const products =
    filters.status === "all"
      ? rawProducts
      : rawProducts.filter((p) => p.status === filters.status);

  const categories = categoriesQuery.data ?? [];
  const isPageLoading = productsQuery.isLoading || categoriesQuery.loading;

  // ─── Inline Price Update ──────────────────────────────────────────────────
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, price, costPrice }: { id: string; price?: number; costPrice?: number }) => {
      await updateProduct(id, { price, costPrice });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Preço atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: error.message || "Erro ao atualizar preço",
      });
    },
  });

  // ─── Duplicate Product ────────────────────────────────────────────────────
  const duplicateProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await duplicateProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto duplicado com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: error.message || "Erro ao duplicar produto",
      });
    },
  });

  // ─── Bulk Delete ───────────────────────────────────────────────────────────
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await deleteProduct(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      toast({ title: "Produtos excluídos com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: error.message || "Erro ao excluir produtos",
      });
    },
  });

  // ─── Bulk Disable (zera estoque de todos os itens) ─────────────────────────
  const bulkDisableMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const productId of ids) {
        const items = await getProductItems(productId);
        await Promise.all(items.map((item) => updateProductItem(item.id, { stock: 0 })));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      toast({ title: "Produtos desativados" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: error.message || "Erro ao desativar produtos",
      });
    },
  });

  // ─── Bulk Enable (set stock=1 no primeiro item) ────────────────────────────
  const bulkEnableMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const productId of ids) {
        const items = await getProductItems(productId);
        if (items.length === 0) {
          toast({
            variant: "destructive",
            title: `Produto sem itens — não é possível ativar automaticamente`,
          });
          continue;
        }
        await updateProductItem(items[0].id, { stock: 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      toast({ title: "Produtos ativados" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: error.message || "Erro ao ativar produtos",
      });
    },
  });

  const isBulkPending =
    bulkDeleteMutation.isPending ||
    bulkDisableMutation.isPending ||
    bulkEnableMutation.isPending;

  if (isPageLoading && !productsQuery.data) {
    return <PageLoader message="Carregando produtos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os produtos cadastrados, filtre e aplique ações em massa.
          </p>
        </div>

        <Button asChild>
          <Link to="/produtos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      <ProductListTable
        products={products}
        categories={categories}
        isLoading={productsQuery.isLoading}
        page={page}
        hasNextPage={meta?.hasNextPage ?? false}
        totalPages={meta?.totalPages}
        onPageChange={(p) => {
          setPage(p);
          setSelectedIds([]);
        }}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
        onBulkDisable={(ids) => bulkDisableMutation.mutate(ids)}
        onBulkEnable={(ids) => bulkEnableMutation.mutate(ids)}
        isBulkPending={isBulkPending}
        onUpdateProduct={async (id, values) => {
          await updateProductMutation.mutateAsync({ id, ...values });
        }}
        onDuplicateProduct={async (id) => {
          await duplicateProductMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}