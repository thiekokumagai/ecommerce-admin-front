export type ProductImage = {
  id: string;
  url: string;
};

export type ProductVariationLink = {
  id: string;
  variationId: string;
};

export type SavedProductVariationOption = {
  id: string;
  value: string;
};

export type SavedProductVariation = {
  id: string;
  variationId: string;
  title: string;
  options: SavedProductVariationOption[];
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
};

export type ProductListMeta = {
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export type ProductResponse = {
  id: string;
  title: string;
  categoryId: string;
  images: ProductImage[];
  imageUrl?: string | null;
  variationIds: string[];
  variations: SavedProductVariation[];
  itemsCount: number;
  price?: number;
  promotionalPrice?: number;
  costPrice?: number;
  description?: string;
  descriptionFormated?: string;
  activeOptionIds: string[];
  totalStock: number;
  primarySku: string | null;
  status: "active" | "inactive";
  items?: ProductItem[];
};


export type ProductVariationLinkPayload = {
  variationIds: string[];
};

export type ProductItemOption = {
  variationId: string;
  optionId: string;
  optionValue: string;
  variationTitle?: string;
};

export type ProductItem = {
  id: string;
  stock: number;
  options: ProductItemOption[];
};

export type CreateProductPayload = {
  title: string;
  categoryId: string;
  price?: number;
  promotionalPrice?: number;
  costPrice?: number;
};

export type CreateProductItemPayload = {
  stock: number;
  options?: string[];
  sku?: string;
};

export type UpdateProductItemPayload = {
  stock: number;
};

export type RemoveProductVariationPayload = {
  variationId: string;
};

export type RemoveProductVariationOptionPayload = {
  variationId: string;
  optionId: string;
};