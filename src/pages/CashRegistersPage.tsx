import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cashRegisterService } from "@/services/cash-register.service";

export default function CashRegistersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
  });

  const { data: registers, isLoading } = useQuery({
    queryKey: ["cash-registers"],
    queryFn: cashRegisterService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: cashRegisterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-registers"] });
      toast.success("Caixa criado com sucesso!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao criar caixa."),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => cashRegisterService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-registers"] });
      toast.success("Caixa atualizado com sucesso!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar caixa."),
  });

  const deleteMutation = useMutation({
    mutationFn: cashRegisterService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-registers"] });
      toast.success("Caixa excluído com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir caixa."),
  });

  const resetForm = () => {
    setFormData({ title: "", startDate: "", endDate: "" });
    setEditingId(null);
  };

  const handleEdit = (register: any) => {
    setFormData({
      title: register.title,
      startDate: register.startDate.split("T")[0],
      endDate: register.endDate.split("T")[0],
    });
    setEditingId(register.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-8">Carregando caixas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Caixas</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Caixa
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers?.map((register) => (
              <TableRow key={register.id}>
                <TableCell className="font-medium">{register.title}</TableCell>
                <TableCell>
                  {format(new Date(register.startDate), "dd/MM/yyyy")} até{" "}
                  {format(new Date(register.endDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(register)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir?")) {
                          deleteMutation.mutate(register.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                    <Link to={`/caixa/${register.id}`}>
                      <Button variant="outline" size="sm">
                        Relatório <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {registers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  Nenhum caixa encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Caixa" : "Novo Caixa"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título (ex: Março 2026)</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
