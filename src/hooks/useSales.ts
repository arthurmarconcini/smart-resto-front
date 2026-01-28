import { useMutation, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateSaleInput, Sale } from "@/types/sales";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export const salesKeys = {
  all: ["sales"] as const,
  lists: () => [...salesKeys.all, "list"] as const,
  list: (filters: { month?: number; year?: number }) =>
    [...salesKeys.lists(), filters] as const,
  details: () => [...salesKeys.all, "detail"] as const,
  detail: (id: string) => [...salesKeys.details(), id] as const,
};

interface UseSalesParams {
  month?: number;
  year?: number;
}

/**
 * Lista vendas com filtros opcionais de mês e ano
 */
export function useSales(params?: UseSalesParams) {
  return useQuery({
    queryKey: salesKeys.list(params || {}),
    queryFn: async () => {
      const { data } = await api.get<Sale[]>("/sales", { params });
      return data;
    },
    staleTime: 30000,
  });
}

/**
 * Busca detalhes de uma venda específica pelo ID
 * Workaround: busca da lista até API ter endpoint GET /sales/:id
 */
export function useSaleDetails(id: string, salesList?: Sale[]) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: async () => {
      if (salesList) {
        const sale = salesList.find((s) => s.id === id);
        if (sale) return sale;
      }
      const { data } = await api.get<Sale[]>("/sales");
      const sale = data.find((s) => s.id === id);
      if (!sale) throw new Error("Venda não encontrada");
      return sale;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

/**
 * Cria nova venda com toast customizado e invalidação de caches
 */
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: CreateSaleInput) => {
      const { data } = await api.post<Sale>("/sales", saleData);
      return data;
    },
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      const valorFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(sale.totalAmount));

      if (sale.type === "ITEMIZED" && sale.items) {
        toast.success("Venda registrada!", {
          description: `${sale.items.length} item(ns) • Total: ${valorFormatado}`,
        });
      } else {
        toast.success("Fechamento registrado!", {
          description: `Total do dia: ${valorFormatado}`,
        });
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || "Erro ao registrar venda";
      toast.error("Erro", { description: message });
    },
  });
}

/**
 * Busca histórico de vendas dos últimos 6 meses para gráficos
 */
export function useSalesHistory() {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(today, 5 - i);
    return {
      date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: format(date, "MMM", { locale: ptBR }),
      fullLabel: format(date, "MMMM yyyy", { locale: ptBR }),
    };
  });

  const results = useQueries({
    queries: months.map((m) => ({
      queryKey: salesKeys.list({ month: m.month, year: m.year }),
      queryFn: async () => {
        const { data } = await api.get<Sale[]>("/sales", {
          params: { month: m.month, year: m.year },
        });
        return data;
      },
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const data = months.map((m, index) => {
    const sales = results[index].data || [];
    const total = sales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

    return {
      name: m.label.charAt(0).toUpperCase() + m.label.slice(1),
      fullDate: m.fullLabel,
      value: total,
      isCurrent: index === 5,
    };
  });

  return { data, isLoading };
}
