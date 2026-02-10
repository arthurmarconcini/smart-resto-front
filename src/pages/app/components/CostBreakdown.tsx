import { useFinanceForecast } from "@/hooks/useFinance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export function CostBreakdown() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const { data: forecast, isLoading, isError } = useFinanceForecast(currentMonth, currentYear);

  if (isLoading) {
    return (
      <Card className="shadow-sm animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-1/2 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o breakdown de custos. Tente novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!forecast) return null;

  const breakDown = forecast.breakDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown de Custos Fixos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Custo Fixo Genérico:</span>
          <span className="font-medium">R$ {(breakDown?.genericFixedCost ?? 0).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Despesas Fixas Detalhadas:</span>
          <span className="font-medium">R$ {(breakDown?.detailedFixedCost ?? 0).toFixed(2)}</span>
        </div>

        {(breakDown?.totalEmployeeCost ?? 0) > 0 && (
          <div className="flex justify-between text-primary">
            <span className="flex items-center gap-1">
              💼 Custos de Funcionários:
            </span>
            <span className="font-semibold">
              R$ {(breakDown?.totalEmployeeCost ?? 0).toFixed(2)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total Custo Fixo:</span>
          <span className="text-primary">R$ {(breakDown?.totalFixedCost ?? 0).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
