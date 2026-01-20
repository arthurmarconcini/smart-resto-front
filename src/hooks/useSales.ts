import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateSaleInput, Sale } from "@/types/sales";

interface GetSalesParams {
    month?: number;
    year?: number;
}

export function useCreateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSaleInput) => {
            const response = await api.post("/sales", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useSales(params?: GetSalesParams) {
    return useQuery({
        queryKey: ["sales", params],
        queryFn: async () => {
            const { data } = await api.get<Sale[]>("/sales", {
                params,
            });
            return data;
        },
    });
}
