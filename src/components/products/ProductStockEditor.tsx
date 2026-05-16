import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProductItem } from "@/types/product";

export type QuickEditMode = "add" | "subtract" | "replace";

type ProductStockEditorProps = {
  productReady: boolean;
  hasVariations: boolean;
  loadingSavedItems: boolean;
  savedItems: ProductItem[];
  directStockValue: string;
  bulkMode: QuickEditMode;
  bulkValues: Record<string, string>;
  isSaving: boolean;
  onModeChange: (mode: QuickEditMode) => void;
  onDirectStockChange: (value: string) => void;
  onValueChange: (itemId: string, value: string) => void;
  onSaveAll: () => void;
};

function getNextStock(currentStock: number, value: number, mode: QuickEditMode) {
  if (mode === "add") return currentStock + value;
  if (mode === "subtract") return Math.max(0, currentStock - value);
  return value;
}

function renderSavedItemLabel(item: ProductItem) {
  return item.options.map((option) => option.optionValue).join(" / ");
}

export function ProductStockEditor({
  productReady,
  hasVariations,
  loadingSavedItems,
  savedItems,
  directStockValue,
  bulkMode,
  bulkValues,
  onModeChange,
  onDirectStockChange,
  onValueChange,
}: ProductStockEditorProps) {
  const directSavedItem = savedItems[0];

  return (
    <Card className="rounded-3xl border bg-card shadow-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg">Estoque</CardTitle>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={bulkMode === "add" ? "default" : "outline"}
            onClick={() => onModeChange("add")}
            className="rounded-xl"
          >
            Somar
          </Button>
          <Button
            type="button"
            size="sm"
            variant={bulkMode === "subtract" ? "default" : "outline"}
            onClick={() => onModeChange("subtract")}
            className="rounded-xl"
          >
            Subtrair
          </Button>
          <Button
            type="button"
            size="sm"
            variant={bulkMode === "replace" ? "default" : "outline"}
            onClick={() => onModeChange("replace")}
            className="rounded-xl"
          >
            Substituir
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!productReady ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Crie o produto antes de configurar o estoque.
          </div>
        ) : !hasVariations ? (
          <div className="space-y-4 rounded-2xl bg-card p-4">
            <div>
              <p className="font-medium">Estoque do produto</p>
              <p className="text-sm text-muted-foreground">
                Como este produto não possui variações, o estoque será salvo diretamente no item padrão.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="w-full md:w-40 space-y-2">
                <p className="text-sm font-medium">Quantidade</p>
                {directSavedItem ? (
                  <p className="text-sm text-muted-foreground">Atual: {directSavedItem.stock}</p>
                ) : null}
                <Input
                  type="number"
                  min="0"
                  value={directStockValue}
                  onChange={(event) => onDirectStockChange(event.target.value)}
                  placeholder="0"
                  className="h-10 rounded-xl"
                />
                
              </div>

              <div className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                Resultado previsto:{" "}
                <span className="font-bold text-foreground">
                  {directStockValue === "" || Number.isNaN(Number(directStockValue))
                    ? directSavedItem?.stock ?? 0
                    : getNextStock(directSavedItem?.stock ?? 0, Number(directStockValue), bulkMode)}
                </span>
              </div>
            </div>
          </div>
        ) : loadingSavedItems ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Carregando itens...
          </div>
        ) : savedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Nenhum item gerado ainda. Tente selecionar opções de variação acima.
          </div>
        ) : (
          <div className="space-y-3">
            {savedItems.map((item) => {
              const rawValue = bulkValues[item.id] ?? "";
              const parsedValue = Number(rawValue);
              const previewStock =
                rawValue === "" || Number.isNaN(parsedValue)
                  ? item.stock
                  : getNextStock(item.stock, parsedValue, bulkMode);

              return (
                <div key={item.id} className="grid gap-3 rounded-2xl bg-card p-4 md:grid-cols-[1fr_160px_220px] md:items-end">
                  <div>
                    <p className="font-medium">
                      {renderSavedItemLabel(item)}
                      {(item as any).isVirtual && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                          Novo
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Atual: {item.stock}</p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Quantidade</p>
                    <Input
                      type="number"
                      min="0"
                      value={rawValue}
                      onChange={(event) => onValueChange(item.id, event.target.value)}
                      placeholder="0"
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    Resultado previsto:{" "}
                    <span className="font-bold text-foreground">{previewStock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
