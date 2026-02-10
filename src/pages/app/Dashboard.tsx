import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SetupBanner } from "@/components/app/SetupBanner";
import { FinanceForecastCard } from "@/pages/finance/components/FinanceForecastCard";
import { useFinanceForecast, useExpenses } from "@/hooks/useFinance";
import { useSales } from "@/hooks/useSales";
import { SalesHistoryChart } from "./components/SalesHistoryChart";
import { DreChart } from "./components/DreChart";
import { UrgentExpensesCard } from "./components/UrgentExpensesCard";
import { CostBreakdownCard } from "./components/CostBreakdownCard";

export function DashboardPage() {
  // Hook Forecast
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const { data: forecast, isLoading: forecastLoading, error: forecastError } = useFinanceForecast(currentMonth, currentYear);
  const { data: sales, isLoading: salesLoading, error: salesError } = useSales({ month: currentMonth, year: currentYear });
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses({ month: currentMonth, year: currentYear });

  const totalRevenue = Array.isArray(sales)
    ? sales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0)
    : 0;

  const totalMonthlyExpenses = forecast?.breakDown
    ? (forecast.breakDown.totalFixedCost || 0) + (forecast.breakDown.variableExpenses || 0)
    : 0;

  const goalRevenue = forecast?.targets?.goalRevenue || 0;

  if (forecastLoading || salesLoading || expensesLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (forecastError || salesError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center max-w-md">
          <p className="text-destructive font-semibold">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground">
            {forecastError?.message || salesError?.message || 'Tente recarregar a página'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <SetupBanner />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground">
              Visão geral da saúde financeira do mês de {format(new Date(), "MMMM", { locale: ptBR })}.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              {format(new Date(), "MMM, yyyy", { locale: ptBR })}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


          {/* Card Ponto de Equilíbrio (Refatorado para usar Hook Híbrido) */}
          <FinanceForecastCard 
            month={currentMonth} 
            year={currentYear} 
          />

          {/* DRE Simplificado (Gráfico) */}
          <DreChart 
            totalRevenue={totalRevenue} 
            totalMonthlyExpenses={totalMonthlyExpenses} 
            goalRevenue={goalRevenue} 
          />

          {/* Breakdown de Custos */}
          <CostBreakdownCard
            month={currentMonth}
            year={currentYear}
          />

          {/* Histórico de Vendas */}
          <SalesHistoryChart />

          {/* Card Previsão de Caixa (Alertas) */}
          <UrgentExpensesCard expenses={expenses} />

        </div>
      </div>
    </div>
  );
}
