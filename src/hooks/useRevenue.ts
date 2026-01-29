import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MonthlyRevenueResponse,
  MonthlyRevenueChartItem,
  CompanyTargetsResponse,
  RevenueChartData,
} from "@/types/revenue";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Query Keys - estrutura otimizada
export const revenueKeys = {
  all: ["revenue"] as const,
  currentMonth: () => [...revenueKeys.all, "current-month"] as const,
  chart: () => [...revenueKeys.all, "chart"] as const,
  targets: () => [...revenueKeys.all, "targets"] as const,
};

/**
 * Busca a receita do mês atual DIRETAMENTE da API
 * ✅ 1 request vs 1 request + reduce anterior
 * Atualiza automaticamente a cada 30 segundos
 */
export function useCurrentMonthRevenue() {
  return useQuery({
    queryKey: revenueKeys.currentMonth(),
    queryFn: async () => {
      const { data } = await api.get<MonthlyRevenueResponse>("/revenue/current-month");
      return data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Busca dados do gráfico de receitas dos últimos 6 meses
 * ✅ 1 request vs 6 requests + reduce anterior
 * Retorna dados já formatados para Recharts
 */
export function useRevenueChart() {
  return useQuery({
    queryKey: revenueKeys.chart(),
    queryFn: async () => {
      const { data } = await api.get<MonthlyRevenueChartItem[]>("/revenue/chart");
      return data;
    },
    staleTime: 60000, // 1 minuto - dados históricos mudam menos
    select: (data): { chartData: RevenueChartData[]; rawData: MonthlyRevenueChartItem[] } => {
      // Transforma para formato do gráfico (period + revenue)
      const chartData: RevenueChartData[] = data.map((item) => {
        const date = new Date(item.year, item.month - 1);
        const monthLabel = format(date, "MMM", { locale: ptBR });
        return {
          period: `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}/${item.year}`,
          revenue: item.totalRevenue,
        };
      });

      return { chartData, rawData: data };
    },
  });
}

/**
 * Busca metas de vendas vs receita atual da empresa
 * ✅ Novo hook - endpoint /companies/targets não estava sendo usado
 */
export function useCompanyTargets() {
  return useQuery({
    queryKey: revenueKeys.targets(),
    queryFn: async () => {
      const { data } = await api.get<CompanyTargetsResponse>("/companies/targets");
      return data;
    },
    staleTime: 30000,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

/**
 * Helper para obter receita do mês anterior a partir dos dados do chart
 * Evita request adicional - usa dados já carregados
 */
export function getPreviousMonthRevenue(chartData: MonthlyRevenueChartItem[]): number {
  if (!chartData || chartData.length < 2) return 0;
  // O array vem ordenado (mais antigo → mais recente), então o penúltimo é o mês anterior
  return chartData[chartData.length - 2]?.totalRevenue || 0;
}
