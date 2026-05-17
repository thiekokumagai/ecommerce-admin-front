import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Trash2, EyeOff, Eye, X } from "lucide-react";
import type { ProductResponse } from "@/types/product";
import { buildImageUrl } from "@/utils/image-url";

const PAGE_SIZE = 30;

type SortField = "title" | "price" | null;
type SortDir = "asc" | "desc";

export interface ProductListTableFilters {
  search: string;
  status: "all" | "active" | "inactive";
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductListTableProps {
  products: ProductResponse[];
  categories: Category[];
  isLoading: boolean;
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  filters: ProductListTableFilters;
  onFiltersChange: (filters: ProductListTableFilters) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkDisable: (ids: string[]) => void;
  onBulkEnable: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  isBulkPending: boolean;
}

export function ProductListTable({
  products,
  categories,
  isLoading,
  page,
  hasNextPage,
  onPageChange,
  filters,
  onFiltersChange,
  selectedIds,
  onSelectionChange,
  onBulkDisable,
  onBulkEnable,
  onBulkDelete,
  isBulkPending,
}: ProductListTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Client-side sort on current page
  const sorted = [...products].sort((a, b) => {
    if (!sortField) return 0;
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortField === "title") return mul * a.title.localeCompare(b.title);
    if (sortField === "price") return mul * ((a.price ?? 0) - (b.price ?? 0));
    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((p) => p.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", status: "all", categoryId: "" });
  };

  const hasFilters = filters.search || filters.status !== "all" || filters.categoryId;

  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = (page - 1) * PAGE_SIZE + products.length;

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkEnable(selectedIds)}
              disabled={isBulkPending}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Ativar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkDisable(selectedIds)}
              disabled={isBulkPending}
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              Desativar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkDelete(selectedIds)}
              disabled={isBulkPending}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          id="product-search"
          placeholder="Buscar produtos..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-56"
        />

        <Select
          value={filters.status}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, status: v as ProductListTableFilters["status"] })
          }
        >
          <SelectTrigger id="product-status-filter" className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, categoryId: v === "all" ? "" : v })
          }
        >
          <SelectTrigger id="product-category-filter" className="w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("title")}
                >
                  Nome <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("price")}
                >
                  Preço <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  data-state={selectedIds.includes(product.id) ? "selected" : undefined}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      id={`select-${product.id}`}
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={() => toggleOne(product.id)}
                      aria-label={`Selecionar ${product.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    {product.images[0] ? (
                      <img
                        src={buildImageUrl(product.images[0].url)}
                        alt={product.title}
                        className="h-10 w-10 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                        —
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/produtos/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {product.price !== undefined
                      ? `R$ ${product.price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.primarySku ?? "—"}
                  </TableCell>
                  <TableCell>{product.totalStock}</TableCell>
                  <TableCell>
                    {product.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: count + pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {products.length > 0
            ? `Mostrando ${startIdx}–${endIdx}`
            : "Nenhum resultado"}
        </span>

        <Pagination className="w-auto mx-0 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-2 text-sm">Página {page}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (hasNextPage) onPageChange(page + 1);
                }}
                aria-disabled={!hasNextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
