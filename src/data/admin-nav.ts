import {
  LayoutDashboard,
  Package,
  FolderTree,
  SlidersHorizontal,
  Ticket,
  ShoppingBag,
  Landmark,
  Settings,
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
      { title: "Caixa", url: "/caixa", icon: Landmark },
    ],
  },
  {
    label: "Configuração",
    items: [
      { title: "Configuração", url: "/configuracoes", icon: Settings },
    ],
  },
];
