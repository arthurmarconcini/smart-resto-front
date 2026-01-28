export enum SaleType {
  DAILY_TOTAL = "DAILY_TOTAL",
  ITEMIZED = "ITEMIZED",
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  product: Product;
}

export interface Sale {
  id: string;
  companyId: string;
  date: string;
  totalAmount: number;
  type: SaleType;
  createdAt: string;
  items?: SaleItem[];
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  date: string;
  type: SaleType;
  totalAmount?: number;
  items?: CreateSaleItemInput[];
}
