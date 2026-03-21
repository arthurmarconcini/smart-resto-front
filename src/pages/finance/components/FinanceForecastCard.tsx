import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinanceForecast } from "@/hooks/useFinance"
import { useSales } from "@/hooks/useSales"
import { Target, TrendingUp, Info } from "lucide-react"
import { differenceInCalendarDays, endOfMonth, startOfToday } from "date-fns"
import { cn } from "@/lib/utils"


interface FinanceForecastCardProps {
  month: number
  year: number
  className?: string
}

export function FinanceForecastCard({ month, year, className }: FinanceForecastCardProps) {
  const { data: forecast, isLoading: isLoadingForecast, error: forecastError } = useFinanceForecast(month, year)
  const { data: sales, isLoading: isLoadingSales, error: salesError } = useSales({ month, year })

  const isLoading = isLoadingForecast || isLoadingSales
  const hasError = forecastError || salesError

  if (isLoading) {
    return (
        <Card className={cn("border-l-4 border-l-primary shadow-sm animate-pulse flex flex-col", className)}>
            <CardHeader className="pb-2">
                <div className="h-6 w-1/3 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
            </CardContent>
        </Card>
    )
  }

  if (hasError) {
    return (
      <Card className={cn("border-l-4 border-l-destructive shadow-sm flex flex-col", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2 text-destructive">
            <Target className="h-5 w-5" />
            Erro ao carregar previsão
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            {forecastError?.message || salesError?.message || 'Erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!forecast?.breakDown || !forecast?.targets || !Array.isArray(sales)) {
    return (
      <Card className={cn("border-l-4 border-l-warning shadow-sm flex flex-col", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-warning" />
            Dados Incompletos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
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
    <Card className={cn("border-l-4 border-l-primary shadow-sm flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Previsão Detalhada
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
        {/* Break-even Progress */}
        <div className="space-y-2">
           <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                  Cobertura de Custos (Rev: <span className="text-foreground font-medium">{formatCurrency(totalRevenue)}</span>)
              </span>
              <span className="font-medium">{Math.round(breakEvenProgress)}%</span>
           </div>
           
           <Progress value={breakEvenProgress} className="h-2" />
           
            <div className="mt-5 border rounded-lg p-4 bg-muted/10 shadow-sm">
                <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Composição de Custos</h4>
                <div className="space-y-2">
                    {/* Custo Base */}
                    {(() => {
                        const baseCost = breakDown.genericFixedCost || 0;
                        return (
                            <div className="flex justify-between items-center text-sm" title="Custo base de manutenção configurado da empresa">
                                <span className="text-muted-foreground">Custo Base</span>
                                <span className="font-medium text-foreground">{formatCurrency(baseCost)}</span>
                            </div>
                        );
                    })()}
                    
                    {/* Funcionários */}
                    {(() => {
                        const employeeCost = forecast.fixedCostsBreakdown?.employeeCosts ?? breakDown.totalEmployeeCost ?? 0;
                        if (employeeCost > 0) {
                            return (
                                <div className="flex justify-between items-center text-sm" title={`Custo total com ${forecast.fixedCostsBreakdown?.employees?.length || 0} funcionário(s) cadastrado(s)`}>
                                    <span className="text-muted-foreground">
                                      Funcionários
                                    </span>
                                    <span className="font-medium text-foreground">{formatCurrency(employeeCost)}</span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    
                    {/* Despesas */}
                    {(() => {
                        const registeredExpenses = (breakDown.detailedFixedCost || 0) + (breakDown.variableExpenses || 0);
                        return (
                            <div className="flex justify-between items-center text-sm" title={`Soma das contas e despesas lançadas: Fixas (${formatCurrency(breakDown.detailedFixedCost || 0)}) + Variáveis (${formatCurrency(breakDown.variableExpenses || 0)})`}>
                                <span className="text-muted-foreground flex items-center gap-1">
                                    Despesas Gerais
                                    <Info className="h-3.5 w-3.5 opacity-70" />
                                </span>
                                <span className="font-medium text-destructive">{formatCurrency(registeredExpenses)}</span>
                            </div>
                        );
                    })()}
                </div>

                <div className="border-t border-border/50 my-3" />

                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Saldo de Custos</span>
                    <span className="text-lg font-bold text-destructive">{formatCurrency(breakEvenRevenue)}</span>
                </div>
            </div>
        </div>

        {/* Daily Target */}
        <div className="pt-2 flex items-center gap-4 bg-muted/20 p-3 rounded-md mt-6">
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

