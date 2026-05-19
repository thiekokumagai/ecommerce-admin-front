export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productItemId: string | null;
  productName: string;
  price: number;
  quantity: number;
  variation: string | null;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  itemsTotal: number;
  freight: number;
  discount: number;
  totalOrder: number;
  totalReceived: number;
  paymentType: string;
  paymentMethod: string;
  pixKey: string | null;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  complement: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
