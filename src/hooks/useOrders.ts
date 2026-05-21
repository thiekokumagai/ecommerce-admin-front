import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderById, cancelOrder, receiveOrder, revertReceiveOrder, updateOrderStatus } from "@/services/order.service";
import { OrderStatus, PaymentStatus } from "@/types/order";

export function useOrders(search?: string, status?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["orders", { search, status, startDate, endDate }],
    queryFn: () => getOrders(search, status, startDate, endDate),
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

export function useReceiveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => receiveOrder(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

export function useRevertReceiveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revertReceiveOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status?: OrderStatus; paymentStatus?: PaymentStatus } }) => 
      updateOrderStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
    },
  });
}
