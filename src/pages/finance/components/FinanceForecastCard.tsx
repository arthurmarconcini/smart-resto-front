import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/store/auth-store"
import { useExpenses } from "@/hooks/useFinance"
import { ExpenseStatus } from "@/types/finance"
import { Target, TrendingUp, DollarSign } from "lucide-react"
import { differenceInCalendarDays, endOfMonth, startOfToday } from "date-fns"

interface FinanceForecastCardProps {
  month: number
  year: number
}

export function FinanceForecastCard({ month, year }: FinanceForecastCardProps) {
  const { company } = useAuth()
  
  // Busca apenas despesas PENDENTES para o cálculo relativo ao que falta pagar
  const { data: expenses = [] } = useExpenses({
    month: month + 1, // API espera 1-12
    year: year,
    status: ExpenseStatus.PENDING
  })

  // Calcula Totais
  const monthlyFixedCost = Number(company?.monthlyFixedCost || 0)
  const totalPendingVariable = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
  
  const totalExpensesTarget = monthlyFixedCost + totalPendingVariable
  
  // Receita (Pode ser integrada futuramente)
  const currentRevenue = 0 
  
  // Cálculos
  const breakEvenProgress = totalExpensesTarget > 0 ? (currentRevenue / totalExpensesTarget) * 100 : 0
  
  const today = startOfToday()
  const lastDayOfMonth = endOfMonth(new Date(year, month))
  
  const daysRemaining = differenceInCalendarDays(lastDayOfMonth, today)
  const actualDaysRemaining = daysRemaining > 0 ? daysRemaining : 1 // Prevent division by zero
  
  const remainingToTarget = Math.max(0, totalExpensesTarget - currentRevenue)
  const dailyTarget = remainingToTarget / actualDaysRemaining

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Previsão Financeira (Mês Atual)
            </CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Break-even Progress */}
        <div className="space-y-2">
           <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso do Mês (Meta: {formatCurrency(totalExpensesTarget)})</span>
              <span className="font-medium">{Math.round(breakEvenProgress)}%</span>
           </div>
           <Progress value={breakEvenProgress} className="h-2" />
           <p className="text-xs text-muted-foreground">
             Baseado em Custos Fixos ({formatCurrency(monthlyFixedCost)}) + Pendentes ({formatCurrency(totalPendingVariable)})
           </p>
        </div>

        {/* Daily Target */}
        <div className="pt-2 flex items-center gap-4 bg-muted/20 p-3 rounded-md">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Meta Diária de Vendas</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(dailyTarget)}
                </p>
                <p className="text-xs text-muted-foreground">
                    Para cobrir despesas nos próximos {actualDaysRemaining} dias
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
