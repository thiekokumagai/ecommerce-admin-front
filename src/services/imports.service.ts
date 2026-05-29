import { apiFetch } from './api';

export const importsService = {
  importCategories: async () => {
    const response = await apiFetch('/imports/vendizap/categories', { method: 'POST' });
    return response.json();
  },

  importProducts: async () => {
    const response = await apiFetch('/imports/vendizap/products', { method: 'POST' });
    return response.json();
  },

  importProductImages: async () => {
    const response = await apiFetch('/imports/vendizap/products/images', { method: 'POST' });
    return response.json();
  },

  importProductVariations: async () => {
    const response = await apiFetch('/imports/vendizap/products/variations', { method: 'POST' });
    return response.json();
  },

  importOrders: async () => {
    const response = await apiFetch('/imports/vendizap/orders', { method: 'POST' });
    return response.json();
  },

  clearDatabase: async () => {
    const response = await apiFetch('/imports/vendizap/clear', { method: 'DELETE' });
    return response.json();
  },
};
