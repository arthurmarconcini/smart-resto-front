import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface DashboardKPIsProps {
  totalRevenue: number;
  totalExpenses: number;
  goalRevenue: number;
}

export function DashboardKPIs({
  totalRevenue,
  totalExpenses,
  goalRevenue,
}: DashboardKPIsProps) {
  const netProfit = totalRevenue - totalExpenses;
  const isProfit = netProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm border-l-4 border-l-success">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Receita Total
            </h3>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold font-heading">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total arrecadado no mês
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-destructive">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Despesas Totais
            </h3>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold font-heading">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Fixas + Variáveis do mês
          </p>
        </CardContent>
      </Card>

      <Card
        className={`shadow-sm border-l-4 ${
          isProfit ? "border-l-primary" : "border-l-warning"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Saldo Previsto
            </h3>
            <DollarSign
              className={`h-4 w-4 ${
                isProfit ? "text-primary" : "text-warning"
              }`}
            />
          </div>
          <div className="text-2xl font-bold font-heading">
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isProfit ? "Lucro estimado" : "Prejuízo estimado"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-muted-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Meta do Mês
            </h3>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-heading">
            {formatCurrency(goalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Objetivo de faturamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
