import { useState, useEffect } from "react";
import { Search, Loader2, MapPin, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/useCustomers";
import { customersService, type Customer, type CustomerAddress } from "@/services/customers.service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SimpleAddressForm } from "@/components/orders/SimpleAddressForm";

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer | null) => void;
  onSelectAddress: (address: CustomerAddress | null) => void;
  initialCustomer?: Customer | null;
}

export function CustomerSearch({ onSelectCustomer, onSelectAddress, initialCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialCustomer?.id || null);
  const [selectedCustomerData, setSelectedCustomerData] = useState<Customer | null>(initialCustomer || null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomerId(initialCustomer.id);
      setSelectedCustomerData(initialCustomer);
      setSearchTerm(initialCustomer.phone || initialCustomer.name);
      
      const defaultAddress = initialCustomer.addresses?.find(a => a.isDefault) || initialCustomer.addresses?.[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [initialCustomer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useCustomers(debouncedTerm ? debouncedTerm : undefined, 1, 5);
  const customers = data?.data || [];
  
  const selectedCustomer = selectedCustomerData;

  // Mask function for phone (optional but requested in plan)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Se o valor contiver apenas números e pontuações comuns de telefone
    if (/^[\d\s\(\)\-]+$/.test(value)) {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 11) digits = digits.slice(0, 11);
      
      if (digits.length > 2) {
        value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      }
      if (digits.length > 9) {
        value = `${value.slice(0, 10)}-${value.slice(10)}`;
      }
    }
    
    setSearchTerm(value);
    // Reset selection when searching again
    if (selectedCustomerId) {
      setSelectedCustomerId(null);
      setSelectedCustomerData(null);
      setSelectedAddressId(null);
      onSelectCustomer(null);
      onSelectAddress(null);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerData(customer);
    onSelectCustomer(customer);
    
    // Auto-select default address if available
    const defaultAddress = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      onSelectAddress(defaultAddress);
    } else {
      setSelectedAddressId(null);
      onSelectAddress(null);
    }
    
    setSearchTerm(customer.phone || customer.name);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar cliente por telefone ou nome..." 
          className="pl-9 h-11"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {!selectedCustomerId && debouncedTerm && customers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {customers.map(customer => (
            <div 
              key={customer.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
              onClick={() => handleSelectCustomer(customer)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{customer.name}</div>
                  <div className="text-sm text-slate-500">{customer.phone}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedCustomerId && debouncedTerm && !isLoading && customers.length === 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <div className="text-sm text-slate-500 text-center mb-2">
            Nenhum cliente encontrado. Cadastre agora:
          </div>
          <Input 
            placeholder="Nome do cliente" 
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <Button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!newCustomerName.trim() || isCreating}
            onClick={async () => {
              setIsCreating(true);
              try {
                const newCustomer = await customersService.createCustomer({
                  name: newCustomerName.trim(),
                  phone: searchTerm, // Use what they typed
                });
                handleSelectCustomer(newCustomer);
                setNewCustomerName(""); // reset
              } catch (e) {
                console.error(e);
              } finally {
                setIsCreating(false);
              }
            }}
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar e Selecionar"}
          </Button>
        </div>
      )}

      {selectedCustomer && (
        <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-lg">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-800">{selectedCustomer.name}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                {selectedCustomer.phone}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Endereço de Entrega
              </h3>
              {!isAddingAddress && (
                <Button variant="outline" size="sm" className="h-8" onClick={() => setIsAddingAddress(true)}>
                  Nova Busca (Google)
                </Button>
              )}
            </div>
            
            {isAddingAddress && (
              <SimpleAddressForm 
                onCancel={() => setIsAddingAddress(false)}
                onSave={(newAddr) => {
                  if (selectedCustomer) {
                    selectedCustomer.addresses = [...(selectedCustomer.addresses || []), newAddr];
                  }
                  setSelectedAddressId(newAddr.id);
                  onSelectAddress(newAddr);
                  setIsAddingAddress(false);
                }}
              />
            )}
            
            {!isAddingAddress && selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
              <RadioGroup 
                value={selectedAddressId || ""} 
                onValueChange={(val) => {
                  setSelectedAddressId(val);
                  onSelectAddress(selectedCustomer.addresses.find(a => a.id === val) || null);
                }}
                className="space-y-2"
              >
                {selectedCustomer.addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-200">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <Label htmlFor={address.id} className="cursor-pointer flex-1">
                      <div className="font-medium text-slate-800">
                        {address.street}, {address.number}
                      </div>
                      <div className="text-sm text-slate-500">
                        {address.neighborhood} - {address.city}/{address.state}
                      </div>
                      <div className="text-sm text-slate-500">
                        CEP: {address.cep} {address.complement && ` | ${address.complement}`}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Este cliente não possui endereços cadastrados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
