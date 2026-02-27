import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinanceForecast } from "@/hooks/useFinance"
import { useSales } from "@/hooks/useSales"
import { Target, TrendingUp, DollarSign, Info } from "lucide-react"
import { differenceInCalendarDays, endOfMonth, startOfToday } from "date-fns"


interface FinanceForecastCardProps {
  month: number
  year: number
}

// Simple internal tooltip wrapper in case the project doesn't have the UI component yet, 
// using crude title attribute as backup if needed, but trying to be clean.
// Actually, since I didn't find the Tooltip component in the search, I'll use a standard browser title on an icon 
// to avoid import errors if the file doesn't exist. 
// User said "Se possível", so I will use a simple implementation.

export function FinanceForecastCard({ month, year }: FinanceForecastCardProps) {
  const { data: forecast, isLoading: isLoadingForecast, error: forecastError } = useFinanceForecast(month, year)
  const { data: sales, isLoading: isLoadingSales, error: salesError } = useSales({ month, year })

  const isLoading = isLoadingForecast || isLoadingSales
  const hasError = forecastError || salesError

  if (isLoading) {
    return (
        <Card className="border-l-4 border-l-primary shadow-sm animate-pulse">
            <CardHeader className="pb-2">
                <div className="h-6 w-1/3 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
            </CardContent>
        </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="border-l-4 border-l-destructive shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2 text-destructive">
            <Target className="h-5 w-5" />
            Erro ao carregar previsão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {forecastError?.message || salesError?.message || 'Erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!forecast?.breakDown || !forecast?.targets || !Array.isArray(sales)) {
    return (
      <Card className="border-l-4 border-l-warning shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-warning" />
            Dados Incompletos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure seus dados financeiros para visualizar a previsão
          </p>
        </CardContent>
      </Card>
    )
  }

  const breakDown = forecast.breakDown
  const targets = forecast.targets

  // Dados da API + Calculo Local de Vendas (Híbrido Frontend/Backend)
  const totalRevenue = sales.reduce((acc, curr) => acc + Number(curr.totalAmount), 0)
  
  const breakEvenRevenue = targets.breakEvenRevenue || 0
  const breakEvenProgress = breakEvenRevenue > 0 ? (totalRevenue / breakEvenRevenue) * 100 : 0
  
  // Formatadores
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Calculate days based on selected month
  const today = startOfToday()
  const selectedDate = new Date(year, month - 1)
  const isCurrentMonth = today.getMonth() === (month - 1) && today.getFullYear() === year
  const isFutureMonth = selectedDate > today

  let actualDaysRemaining = 1

  if (isCurrentMonth) {
    // Current month: calculate from today to end of month
    const lastDayOfMonth = endOfMonth(today)
    const days = differenceInCalendarDays(lastDayOfMonth, today)
    actualDaysRemaining = days > 0 ? days : 1
  } else if (isFutureMonth) {
    // Future month: calculate total days in that month
    const lastDayOfMonth = endOfMonth(selectedDate)
    const days = lastDayOfMonth.getDate() // Total days in the month
    actualDaysRemaining = days
  } else {
    // Past month: verify if met (usually 1 just to show total gap if any)
    actualDaysRemaining = 1
  }

  // Recalculo da Meta Diária (Frontend) para garantir consistência com a Receita Atual
  // Meta Diária = (MetaTotal - JáFaturado) / DiasRestantes
  const leftToPay = Math.max(0, breakEvenRevenue - totalRevenue)
  const dailyTarget = leftToPay / actualDaysRemaining

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Previsão Detalhada
            </CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Break-even Progress */}
        <div className="space-y-2">
           <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                  Cobertura de Custos (Rev: <span className="text-foreground font-medium">{formatCurrency(totalRevenue)}</span>)
              </span>
              <span className="font-medium">{Math.round(breakEvenProgress)}%</span>
           </div>
           
           <Progress value={breakEvenProgress} className="h-2" />
           
            <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
              <span className="mr-1">Composição:</span>
              
              {/* Custo Base */}
              {(() => {
                const baseCost = breakDown.genericFixedCost || 0;
                return (
                  <div className="flex items-center gap-1 font-medium bg-muted/50 px-2 py-0.5 rounded-md cursor-help border border-border/50" 
                       title={`Custo base de manutenção configurado da empresa`}>
                    Base ({formatCurrency(baseCost)})
                  </div>
                );
              })()}

              {(() => {
                const employeeCost = forecast.fixedCostsBreakdown?.employeeCosts ?? breakDown.totalEmployeeCost ?? 0;
                if (employeeCost > 0) {
                  return (
                    <>
                      <span className="text-muted-foreground/50">+</span>
                      <div 
                        className="flex items-center gap-1 font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md cursor-help border border-primary/20" 
                        title={`Custo total com ${forecast.fixedCostsBreakdown?.employees?.length || 0} funcionário(s) cadastrado(s)`}
                      >
                        👥 Funcionários ({formatCurrency(employeeCost)})
                      </div>
                    </>
                  );
                }
                return null;
              })()}
              
              <span className="text-muted-foreground/50">+</span>
              
              {/* Despesas Lançadas (Fixas + Variáveis) */}
              {(() => {
                const registeredExpenses = (breakDown.detailedFixedCost || 0) + (breakDown.variableExpenses || 0);
                return (
                  <div className="flex items-center gap-1 font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-md cursor-help border border-destructive/20"
                       title={`Soma das contas e despesas lançadas: Fixas (${formatCurrency(breakDown.detailedFixedCost || 0)}) + Variáveis (${formatCurrency(breakDown.variableExpenses || 0)})`}>
                    Despesas ({formatCurrency(registeredExpenses)})
                    <Info className="h-3 w-3 opacity-70" />
                  </div>
                );
              })()}
            </div>
        </div>

        {/* Daily Target */}
        <div className="pt-2 flex items-center gap-4 bg-muted/20 p-3 rounded-md">
            <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Meta Diária Necessária</p>
                <p className="text-xl font-bold text-primary">
                    {formatCurrency(dailyTarget)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Para pagar todas as contas nos próximos {actualDaysRemaining} dias
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

