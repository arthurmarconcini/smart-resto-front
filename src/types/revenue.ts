/**
 * Tipos para o módulo de Receitas
 */

// Response do GET /revenue/current-month
export interface MonthlyRevenueResponse {
  month: number;              // Mês atual (1-12)
  year: number;               // Ano atual
  totalRevenue: number;       // Receita REAL calculada das vendas
  salesCount: number;         // Quantidade de vendas no mês
  consolidatedRevenue: number | null; // Valor consolidado em MonthlyRevenue
}

// Item do array de GET /revenue/chart
export interface MonthlyRevenueChartItem {
  id: string;
  month: number;
  year: number;
  totalRevenue: number;
}

// Response do GET /companies/targets (estrutura real da API)
export interface CompanyTargetsResponse {
  totalToSell: number;
  dailyTarget: number;
  monthlyTarget: number;
  avgProductQty: number;
  breakDown: {
    genericFixedCost: number;
    detailedFixedCost: number;
    totalFixedCost: number;
    variableCost?: number;
    targetProfit?: number;
  };
  metrics: {
    expensesSum: number;
    monthlyFixedCost: number;
    targetProfitValue: number;
    variableCostPercent?: number;
  };
}

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
