import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFinanceForecast } from "@/hooks/useFinance";
import { Banknote, FileText, Users } from "lucide-react";

interface CostBreakdownCardProps {
  month: number;
  year: number;
}

export function CostBreakdownCard({ month, year }: CostBreakdownCardProps) {
  const { data: forecast, isLoading } = useFinanceForecast(month + 1, year);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  if (isLoading || !forecast) {
    return (
      <Card className="shadow-sm animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-1/2 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { breakDown } = forecast;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          Composição dos Custos Fixos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Custo Fixo Base (Estático)
          </span>
          <span className="font-medium">
            {formatCurrency(breakDown.genericFixedCost)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Despesas Fixas Lançadas
          </span>
          <span className="font-medium">
            {formatCurrency(breakDown.detailedFixedCost)}
          </span>
        </div>

        {breakDown.totalEmployeeCost > 0 && (
          <div className="flex justify-between items-center text-primary">
            <span className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Custos de Funcionários
            </span>
            <span className="font-semibold">
              {formatCurrency(breakDown.totalEmployeeCost)}
            </span>
          </div>
        )}

        <Separator className="my-2" />

        <div className="flex justify-between items-center text-base">
          <span className="font-semibold">Total Custos Fixos</span>
          <span className="font-bold text-primary text-lg">
            {formatCurrency(breakDown.totalFixedCost)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
