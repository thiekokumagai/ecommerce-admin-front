import { apiFetch } from "./api";
import { Order } from "@/types/order";

export async function getOrders(search?: string, status?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiFetch(`/orders${query}`);
  return response.json();
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await apiFetch(`/orders/${id}`);
  return response.json();
}

export async function cancelOrder(id: string): Promise<Order> {
  const response = await apiFetch(`/orders/${id}/cancel`, {
    method: "POST",
  });
  return response.json();
}
