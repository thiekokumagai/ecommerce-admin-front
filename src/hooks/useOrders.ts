import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderById, cancelOrder } from "@/services/order.service";

export function useOrders(search?: string, status?: string) {
  return useQuery({
    queryKey: ["orders", { search, status }],
    queryFn: () => getOrders(search, status),
  });
}

export function useOrderDetails(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
