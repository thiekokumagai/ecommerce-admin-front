import {
  LayoutDashboard,
  Package,
  FolderTree,
  SlidersHorizontal,
  Ticket,
  ShoppingBag,
  Landmark,
  Settings,
  Receipt,
  Users,
  Download,
} from "lucide-react";

export const dashboardNavItem = {
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
};

export const navSections = [
  {
    label: "Catálogo",
    items: [
      { title: "Produtos", url: "/produtos", icon: Package },
      { title: "Categorias", url: "/categorias", icon: FolderTree },
      { title: "Variações", url: "/variacoes", icon: SlidersHorizontal },
      { title: "Cupons", url: "/cupons", icon: Ticket },
    ],
  },
  {
    label: "Vendas",
    items: [
      { title: "Pedidos", url: "/pedidos", icon: ShoppingBag },
      { title: "Clientes", url: "/clientes", icon: Users },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { title: "Caixa Atual", url: "/financeiro/atual", icon: Landmark },
      { title: "Contas Fixas", url: "/financeiro/custos-fixos", icon: Receipt },
      { title: "Módulo de Investimento", url: "/investimentos", icon: Landmark },
      { title: "Histórico de Caixas", url: "/caixa", icon: FolderTree },
    ],
  },
  {
    label: "Configuração",
    items: [
      { title: "Configuração", url: "/configuracoes", icon: Settings },
      { title: "Importações", url: "/importacoes", icon: Download },
    ],
  },
];
