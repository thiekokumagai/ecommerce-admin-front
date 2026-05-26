import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investment.service";
import { toast } from "@/components/ui/use-toast";

export function useInvestmentSummary() {
  return useQuery({
    queryKey: ["investment-summary"],
    queryFn: investmentService.getSummary,
  });
}

export function useInvestmentTransactions() {
  return useQuery({
    queryKey: ["investment-transactions"],
    queryFn: investmentService.getTransactions,
  });
}

export function useAddInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: investmentService.addInvestment,
    onSuccess: () => {
      toast({ title: "Investimento adicionado", description: "O valor foi adicionado ao módulo de investimentos com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["investment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["investment-transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar investimento",
        description: error.message || "Ocorreu um erro.",
      });
    },
  });
}

export function useRegisterPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: investmentService.registerPurchase,
    onSuccess: () => {
      toast({ title: "Compra registrada", description: "O valor foi subtraído da sua carteira de investimentos." });
      queryClient.invalidateQueries({ queryKey: ["investment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["investment-transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao registrar compra",
        description: error.message || "Ocorreu um erro.",
      });
    },
  });
}

export function useDeleteInvestmentTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: investmentService.deleteTransaction,
    onSuccess: () => {
      toast({ title: "Transação excluída", description: "A transação de investimento foi excluída com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["investment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["investment-transactions"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir transação",
        description: error.message || "Ocorreu um erro.",
      });
    },
  });
}
