import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";
import type { ProductListParams } from "@/types/product";

export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}