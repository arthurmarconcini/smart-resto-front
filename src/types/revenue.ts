/**
 * Tipos para o módulo de Receitas
 */

// Dados de receita calculada a partir das vendas
export interface RevenueData {
  month: number;
  year: number;
  totalRevenue: number;
  salesCount: number;
}

// Formato para o gráfico Recharts
export interface RevenueChartData {
  period: string;
  revenue: number;
}
