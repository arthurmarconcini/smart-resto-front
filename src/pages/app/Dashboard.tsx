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
import { DashboardKPIs } from "./components/DashboardKPIs";

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

  const baseCost = forecast?.breakDown?.genericFixedCost || 0;
  const employeeCost = forecast?.fixedCostsBreakdown?.employeeCosts ?? forecast?.breakDown?.totalEmployeeCost ?? 0;
  const registeredExpenses = (forecast?.breakDown?.detailedFixedCost || 0) + (forecast?.breakDown?.variableExpenses || 0);

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

        {/* Top KPI Cards Component */}
        <DashboardKPIs 
          totalRevenue={totalRevenue}
          totalExpenses={baseCost + employeeCost + registeredExpenses}
          goalRevenue={goalRevenue}
        />

        {/* Second Row: Visual Summary and Detailed Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DRE Simplificado (Gráfico) - 2 columns */}
          <div className="lg:col-span-2 flex flex-col">
            <DreChart 
              totalRevenue={totalRevenue} 
              baseCost={baseCost}
              employeeCost={employeeCost}
              registeredExpenses={registeredExpenses} 
              goalRevenue={goalRevenue} 
            />
          </div>
          
          {/* Card Previsão Detalhada - 1 column */}
          <div className="flex flex-col">
            <FinanceForecastCard 
              month={currentMonth} 
              year={currentYear} 
            />
          </div>
        </div>

        {/* Third Row: Analytics and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histórico de Vendas - 2 columns */}
          <div className="lg:col-span-2 flex flex-col">
            <SalesHistoryChart />
          </div>

          {/* Breakdown de Custos - 1 column */}
          <div className="flex flex-col">
            <CostBreakdownCard
              month={currentMonth}
              year={currentYear}
            />
          </div>
        </div>

        {/* Fourth Row: Alerts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Card Previsão de Caixa (Alertas) */}
          <UrgentExpensesCard expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
