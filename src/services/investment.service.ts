import { apiFetch } from "./api";

export interface InvestmentTransaction {
  id: string;
  type: "ENTRY" | "OUTFLOW";
  amount: number;
  description?: string;
  createdAt: string;
}

export interface InvestmentSummary {
  totalBalance: number;
  totalEntries: number;
  totalOutflows: number;
}

export const investmentService = {
  getSummary: async (): Promise<InvestmentSummary> => {
    const response = await apiFetch("/investments/summary");
    return response.json();
  },

  getTransactions: async (): Promise<InvestmentTransaction[]> => {
    const response = await apiFetch("/investments/transactions");
    return response.json();
  },

  addInvestment: async (payload: { amount: number; description?: string }): Promise<InvestmentTransaction> => {
    const response = await apiFetch("/investments/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  registerPurchase: async (payload: { amount: number; description: string }): Promise<InvestmentTransaction> => {
    const response = await apiFetch("/investments/purchase", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.json();
  },
};
