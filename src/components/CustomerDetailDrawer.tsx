import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCustomerDetails, useUpdateCustomer } from "@/hooks/useCustomers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Phone, MapPin, CalendarDays, Edit2, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CustomerDetailDrawerProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerDetailDrawer({ customerId, isOpen, onClose }: CustomerDetailDrawerProps) {
  const { data: customer, isLoading } = useCustomerDetails(customerId);
  const updateMutation = useUpdateCustomer();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (customer) {
      setEditData({ name: customer.name, phone: customer.phone });
      setIsEditing(false);
    }
  }, [customer, isOpen]);

  const handleSave = async () => {
    if (!customerId) return;
    try {
      await updateMutation.mutateAsync({ id: customerId, data: editData });
      toast({ title: "Cliente atualizado com sucesso" });
      setIsEditing(false);
    } catch (e) {
      toast({ title: "Erro ao atualizar cliente", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl h-[90vh] overflow-hidden bg-white p-0 border border-slate-200 shadow-2xl flex flex-col rounded-2xl">
        <DialogTitle className="sr-only">Detalhes do Cliente</DialogTitle>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm text-slate-500 font-medium animate-pulse">Carregando dados do cliente...</p>
          </div>
        ) : !customer ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <User className="h-8 w-8" />
            <p className="text-sm font-semibold">Cliente não encontrado</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header with back button */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button 
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-violet-700 transition-colors text-sm font-semibold group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Voltar</span>
                </button>
              </div>

              {/* Informações Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    Dados Pessoais
                  </h3>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="h-8 bg-violet-600 hover:bg-violet-700">
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Salvar
                    </Button>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    {isEditing ? (
                      <Input 
                        value={editData.name} 
                        onChange={e => setEditData(prev => ({...prev, name: e.target.value}))}
                        className="h-9 border-slate-200 focus-visible:ring-violet-600 rounded-xl"
                      />
                    ) : (
                      <div className="font-semibold text-slate-800 text-base">{customer.name}</div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      Telefone
                    </label>
                    {isEditing ? (
                      <Input 
                        value={editData.phone} 
                        onChange={e => setEditData(prev => ({...prev, phone: e.target.value}))}
                        className="h-9 border-slate-200 focus-visible:ring-violet-600 rounded-xl"
                      />
                    ) : (
                      <div className="font-semibold text-slate-800 text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <CalendarDays className="h-4 w-4" />
                    Cadastrado em {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Endereços */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Endereços Salvos ({customer.addresses?.length || 0})
                </h3>

                <div className="space-y-3">
                  {customer.addresses?.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/60 p-6 text-center text-slate-400 font-medium text-sm">
                      Nenhum endereço salvo.
                    </div>
                  ) : (
                    customer.addresses?.map((addr) => (
                      <div key={addr.id} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm relative overflow-hidden">
                        {addr.isDefault && (
                          <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            PRINCIPAL
                          </div>
                        )}
                        <p className="font-bold text-slate-800 text-base">{addr.street}, {addr.number}</p>
                        <p className="text-sm text-slate-500 font-medium">{addr.neighborhood}</p>
                        <p className="text-sm text-slate-500 font-medium">{addr.city} - {addr.state}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1 tracking-widest">{addr.cep}</p>
                        {addr.complement && (
                          <p className="text-sm text-slate-400 mt-2 italic">{addr.complement}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
