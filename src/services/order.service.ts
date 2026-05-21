import { apiFetch } from "./api";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";

export async function getOrders(search?: string, status?: string, startDate?: string, endDate?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

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

export async function receiveOrder(id: string, payload: {
  paymentMethod?: string;
  discount?: number;
  surcharge?: number;
  totalReceived: number;
  installments?: number;
}): Promise<Order> {
  const response = await apiFetch(`/orders/${id}/receive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function revertReceiveOrder(id: string): Promise<Order> {
  const response = await apiFetch(`/orders/${id}/revert-receive`, {
    method: "POST",
  });
  return response.json();
}

export async function updateOrderStatus(id: string, payload: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}): Promise<Order> {
  const response = await apiFetch(`/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}
