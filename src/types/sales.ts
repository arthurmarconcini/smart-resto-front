export enum SaleType {
    DAILY_TOTAL = 'DAILY_TOTAL',
    ITEMIZED = 'ITEMIZED'
}

export interface SaleItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface Sale {
    id: string;
    date: string;
    totalAmount: number;
    type: SaleType;
    items: SaleItem[];
}

export interface CreateSaleItemInput {
    productId: string;
    quantity: number;
}

export interface CreateSaleInput {
    date: string;
    type: SaleType;
    totalAmount?: number; // Required if DAILY_TOTAL
    items?: CreateSaleItemInput[]; // Required if ITEMIZED
}
