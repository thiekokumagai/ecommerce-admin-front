import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { PaymentRule } from "@/types/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Percent, Settings, Save } from "lucide-react";

export function PaymentRulesSettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [rules, setRules] = useState<PaymentRule[]>([]);

  useEffect(() => {
    if (settings) {
      setRules(settings.paymentRules || []);
    }
  }, [settings]);

  const handleAddRule = () => {
    const newRule: PaymentRule = {
      id: Math.random().toString(36).substring(2, 9),
      paymentMethod: "pix",
      type: "discount",
      value: 0,
    };
    setRules((prev) => [...prev, newRule]);
    toast({ title: "Nova regra adicionada!" });
  };

  const handleRemoveRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Regra removida." });
  };

  const handleUpdateRule = <K extends keyof PaymentRule>(
    id: string,
    key: K,
    val: PaymentRule[K]
  ) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [key]: val };
        
        // Se mudar de cartão de crédito para outro, remover parcelamento
        if (key === "paymentMethod" && val !== "credit") {
          delete updated.maxInstallments;
        }

        return updated;
      })
    );
  };

  const handleSave = async () => {
    // Validar se há alguma regra sem valor ou inconsistente
    for (const rule of rules) {
      if (rule.value < 0) {
        toast({
          variant: "destructive",
          title: "Valor inválido",
          description: "Os valores de desconto ou taxa devem ser maiores ou iguais a 0.",
        });
        return;
      }
    }

    try {
      await updateSettingsMutation.mutateAsync({
        paymentRules: rules,
      });

      toast({
        title: "Regras dinâmicas salvas!",
        description: "Suas regras de desconto, taxa e parcelas foram salvas no banco com sucesso.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Falha ao salvar as regras de pagamentos.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 text-center text-muted-foreground">
          Carregando regras de taxas e descontos...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Descontos, Taxas e Parcelas
            </h2>
            <p className="text-xs text-muted-foreground">
              Adicione regras customizadas para cada método de pagamento ativo.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Configuração
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateSettingsMutation.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {updateSettingsMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg bg-muted/20">
            <Percent className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma regra ativa criada</p>
            <p className="text-xs text-muted-foreground">Clique em "Nova Configuração" para iniciar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
              <div className="col-span-3">Forma de Pagamento</div>
              <div className="col-span-3">Ação (Desconto/Taxa)</div>
              <div className="col-span-2">Valor (%)</div>
              <div className="col-span-3">Parcelamento Máximo</div>
              <div className="col-span-1 text-right"></div>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-lg border bg-muted/40 sm:bg-transparent sm:p-0 sm:border-none sm:rounded-none items-center"
                >
                  {/* Forma de Pagamento */}
                  <div className="col-span-3">
                    <Label className="sm:hidden text-[10px] uppercase font-semibold text-muted-foreground mb-1">Forma de Pagamento</Label>
                    <Select
                      value={rule.paymentMethod}
                      onValueChange={(val) => handleUpdateRule(rule.id, "paymentMethod", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="debit">Cartão de Débito (Maquininha)</SelectItem>
                        <SelectItem value="credit">Cartão de Crédito (Maquininha)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de Ação */}
                  <div className="col-span-3">
                    <Label className="sm:hidden text-[10px] uppercase font-semibold text-muted-foreground mb-1">Ação</Label>
                    <Select
                      value={rule.type}
                      onValueChange={(val: 'discount' | 'charge') => handleUpdateRule(rule.id, "type", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Desconto</SelectItem>
                        <SelectItem value="charge">Acréscimo (Taxa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor (%) */}
                  <div className="col-span-2">
                    <Label className="sm:hidden text-[10px] uppercase font-semibold text-muted-foreground mb-1">Valor (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, "value", Number(e.target.value))}
                        className="h-9 pr-6"
                      />
                      <span className="absolute right-2 top-2 text-xs font-semibold text-muted-foreground">%</span>
                    </div>
                  </div>

                  {/* Parcelas (Específico para Cartão de Crédito) */}
                  <div className="col-span-3">
                    <Label className="sm:hidden text-[10px] uppercase font-semibold text-muted-foreground mb-1">Parcelamento Máximo</Label>
                    {rule.paymentMethod === "credit" ? (
                      <Select
                        value={rule.maxInstallments ? String(rule.maxInstallments) : "1"}
                        onValueChange={(val) => handleUpdateRule(rule.id, "maxInstallments", Number(val))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Parcelas..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Até 1x (À vista)</SelectItem>
                          <SelectItem value="2">Até 2x sem juros</SelectItem>
                          <SelectItem value="3">Até 3x sem juros</SelectItem>
                          <SelectItem value="4">Até 4x sem juros</SelectItem>
                          <SelectItem value="5">Até 5x sem juros</SelectItem>
                          <SelectItem value="6">Até 6x sem juros</SelectItem>
                          <SelectItem value="8">Até 8x sem juros</SelectItem>
                          <SelectItem value="10">Até 10x sem juros</SelectItem>
                          <SelectItem value="12">Até 12x sem juros</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-9 flex items-center px-3 bg-muted/20 border rounded-md text-xs text-muted-foreground select-none">
                        Não aplicável
                      </div>
                    )}
                  </div>

                  {/* Exclusão */}
                  <div className="col-span-1 text-right flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive h-9 w-9 hover:bg-destructive/10"
                      onClick={() => handleRemoveRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
