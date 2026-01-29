import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FinanceForecastCard } from "@/pages/finance/components/FinanceForecastCard";
import {
  useCurrentMonthRevenue,
  useRevenueChart,
  getPreviousMonthRevenue,
} from "@/hooks/useRevenue";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard de Receitas
 * ✅ Otimizado: 3 requests (vs 7+ antes)
 * - /revenue/current-month
 * - /revenue/chart
 * - /companies/targets
 */
export function RevenueDashboard() {
  const {
    data: currentMonth,
    isLoading: isLoadingCurrent,
    isError: isErrorCurrent,
    refetch: refetchCurrent,
  } = useCurrentMonthRevenue();

  const {
    data: chartResult,
    isLoading: isLoadingChart,
    isError: isErrorChart,
  } = useRevenueChart();

  // Calcular comparativo usando dados do chart (evita request adicional)
  const previousMonthRevenue = chartResult?.rawData
    ? getPreviousMonthRevenue(chartResult.rawData)
    : 0;

  const currentValue = currentMonth?.totalRevenue || 0;

  let percentageChange = 0;
  if (previousMonthRevenue > 0) {
    percentageChange = ((currentValue - previousMonthRevenue) / previousMonthRevenue) * 100;
  } else if (currentValue > 0) {
    percentageChange = 100;
  }

  const isPositiveChange = percentageChange >= 0;
  const isLoading = isLoadingCurrent || isLoadingChart;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-64" />
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground flex items-center gap-3">
              📊 Dashboard de Receitas
              <Badge variant="secondary" className="text-xs">
                Otimizado
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe a evolução das receitas de{" "}
              {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <button
            onClick={() => refetchCurrent()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        {/* Cards de Métricas - 3 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Receita do Mês */}
          <Card className="border-l-4 border-l-success shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita do Mês
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-success" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {isErrorCurrent ? (
                <p className="text-destructive text-sm">Erro ao carregar dados</p>
              ) : (
                <>
                  <div
                    className="text-3xl font-bold text-foreground"
                    aria-label={`Receita do mês: ${formatCurrency(currentValue)}`}
                  >
                    {formatCurrency(currentValue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMonth && currentMonth.salesCount > 0
                      ? `${currentMonth.salesCount} venda(s) registrada(s)`
                      : "Nenhuma venda registrada este mês"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card: Comparativo Mensal */}
          <Card className={`border-l-4 shadow-sm ${isPositiveChange ? "border-l-success" : "border-l-destructive"}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comparativo Mensal
              </CardTitle>
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  isPositiveChange ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    isPositiveChange ? "text-success" : "text-destructive"
                  }`}
                  aria-label={`Variação de ${percentageChange.toFixed(1)} porcento`}
                >
                  {isPositiveChange ? "↑" : "↓"} {Math.abs(percentageChange).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs. mês anterior ({formatCurrency(previousMonthRevenue)})
              </p>
            </CardContent>
          </Card>

          {/* Card: Previsão Detalhada - Mesmo do Dashboard Principal */}
          <FinanceForecastCard 
            month={new Date().getMonth()} 
            year={new Date().getFullYear()} 
          />
        </div>

        {/* Gráfico de Evolução */}
        <Card className="col-span-full shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>
              Receitas dos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isErrorChart ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Erro ao carregar gráfico. Tente novamente.
              </div>
            ) : chartResult?.chartData && chartResult.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartResult.chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("pt-BR", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => [formatCurrency(Number(value) || 0), "Receita"]}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FACC15"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    connectNulls={true}
                    dot={{ fill: "#FACC15", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#FACC15", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <DollarSign className="h-12 w-12 opacity-20" />
                <p>Sem dados de receitas para exibir</p>
                <p className="text-xs">Registre vendas para visualizar o gráfico</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
