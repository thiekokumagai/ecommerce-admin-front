export interface PaymentRule {
  id: string;
  paymentMethod: string; // 'pix' | 'cash' | 'debit' | 'credit'
  type: 'discount' | 'charge';
  value: number;
  maxInstallments?: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  topHeaderText: string | null;
  bannerUrls: string[];
  phone: string;
  instagram: string | null;
  
  // Endereço
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string | null;
  hideAddress: boolean;
  
  // Pagamentos
  pixEnabled: boolean;
  pixKeyType: string | null;
  pixKey: string | null;
  pixHolder: string | null;
  
  payOnDeliveryCash: boolean;
  payOnDeliveryCardDebit: boolean;
  payOnDeliveryCardCredit: boolean;
  
  paymentRules: PaymentRule[];
  
  createdAt?: string;
  updatedAt?: string;
}
