import { api } from "./api";

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
    const { data } = await api.get("/investments/summary");
    return data;
  },

  getTransactions: async (): Promise<InvestmentTransaction[]> => {
    const { data } = await api.get("/investments/transactions");
    return data;
  },

  addInvestment: async (payload: { amount: number; description?: string }): Promise<InvestmentTransaction> => {
    const { data } = await api.post("/investments/add", payload);
    return data;
  },

  registerPurchase: async (payload: { amount: number; description: string }): Promise<InvestmentTransaction> => {
    const { data } = await api.post("/investments/purchase", payload);
    return data;
  },
};
