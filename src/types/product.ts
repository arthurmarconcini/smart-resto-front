export interface Product {
    id: string;
    name: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    markup: number;
    stock: number;
    unit: 'UN' | 'KG' | 'L';
    categoryId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
}

export interface GetProductsResponse {
    data: Product[];
    meta: {
        page: number;
        total: number;
        lastPage: number;
        perPage: number;
    };
}
