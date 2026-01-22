import { useMutation, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateSaleInput, Sale } from "@/types/sales";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function useSalesHistory() {
    const today = new Date();
    // Generate last 6 months including current
    const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(today, 5 - i); // 5 months ago to now
        return {
            date,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            label: format(date, "MMM", { locale: ptBR }),
            fullLabel: format(date, "MMMM yyyy", { locale: ptBR })
        };
    });

    const results = useQueries({
        queries: months.map((m) => ({
            queryKey: ["sales", { month: m.month, year: m.year }],
            queryFn: async () => {
                const { data } = await api.get<Sale[]>("/sales", {
                    params: { month: m.month, year: m.year },
                });
                return data;
            },
        })),
    });

    const isLoading = results.some((r) => r.isLoading);
    
    // Combine results
    const data = months.map((m, index) => {
        const queryResult = results[index];
        const sales = queryResult.data || [];
        const total = sales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
        
        return {
            name: m.label.charAt(0).toUpperCase() + m.label.slice(1), // Capitalize
            fullDate: m.fullLabel,
            value: total,
            isCurrent: index === 5 // Last one is current
        };
    });

    return { data, isLoading };
}
