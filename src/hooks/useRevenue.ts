import { useQuery, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Sale } from "@/types/sales";
import type { RevenueChartData } from "@/types/revenue";
import { subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const revenueKeys = {
  all: ["revenue"] as const,
  currentMonth: () => [...revenueKeys.all, "current-month"] as const,
  chart: (months: number) => [...revenueKeys.all, "chart", { months }] as const,
};

/**
 * Busca a receita do mês atual calculada a partir das vendas
 * Atualiza automaticamente a cada 30 segundos
 */
export function useCurrentMonthRevenue() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return useQuery({
    queryKey: revenueKeys.currentMonth(),
    queryFn: async () => {
      try {
        const { data } = await api.get<Sale[]>("/sales", {
          params: { month: currentMonth, year: currentYear },
        });

        const totalRevenue = data.reduce(
          (acc, sale) => acc + Number(sale.totalAmount),
          0
        );

        return { month: currentMonth, year: currentYear, totalRevenue, salesCount: data.length };
      } catch {
        return { month: currentMonth, year: currentYear, totalRevenue: 0, salesCount: 0 };
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Busca dados do gráfico de receitas dos últimos N meses
 * Utiliza useQueries para buscar dados de cada mês em paralelo
 */
export function useRevenueChart(months: number = 6) {
  const today = new Date();

  const monthsArray = Array.from({ length: months }, (_, i) => {
    const date = subMonths(today, months - 1 - i);
    return {
      date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: format(date, "MMM", { locale: ptBR }),
    };
  });

  const results = useQueries({
    queries: monthsArray.map((m) => ({
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
  const isError = results.some((r) => r.isError);

  const data: RevenueChartData[] = monthsArray.map((m, index) => {
    const sales = results[index].data || [];
    const revenue = sales.reduce((acc, sale) => acc + Number(sale.totalAmount), 0);

    return {
      period: `${m.label.charAt(0).toUpperCase()}${m.label.slice(1)}/${m.year}`,
      revenue,
    };
  });

  return { data, isLoading, isError };
}

/**
 * Busca a receita do mês anterior para comparativo
 */
export function usePreviousMonthRevenue() {
  const previousDate = new Date();
  previousDate.setMonth(previousDate.getMonth() - 1);
  const month = previousDate.getMonth() + 1;
  const year = previousDate.getFullYear();

  return useQuery({
    queryKey: [...revenueKeys.all, "previous-month", { month, year }],
    queryFn: async () => {
      try {
        const { data } = await api.get<Sale[]>("/sales", {
          params: { month, year },
        });

        const totalRevenue = data.reduce(
          (acc, sale) => acc + Number(sale.totalAmount),
          0
        );

        return { month, year, totalRevenue, salesCount: data.length };
      } catch {
        return { month, year, totalRevenue: 0, salesCount: 0 };
      }
    },
    staleTime: 60000,
  });
}
