import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, GetProductsParams, GetProductsResponse } from "@/types/product";

export function useProducts(params?: GetProductsParams) {
    return useQuery({
        queryKey: ["products", params],
        queryFn: async () => {
            const { data } = await api.get<GetProductsResponse>("/products", {
                params,
            });
            return data;
        },
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
            const { data: response } = await api.post<Product>("/products", data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            const { data: response } = await api.put<Product>(`/products/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}
