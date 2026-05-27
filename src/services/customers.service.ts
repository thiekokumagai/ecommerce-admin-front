import { api } from './api';

export interface CustomerAddress {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  complement?: string | null;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  addresses: CustomerAddress[];
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customersService = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<PaginatedCustomers>('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: string) => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  updateCustomer: async (id: string, data: { name?: string; phone?: string }) => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },
};
