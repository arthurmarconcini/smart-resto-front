import { useFinanceForecast } from "@/hooks/useFinance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export function CostBreakdown() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const { data: forecast } = useFinanceForecast(currentMonth, currentYear);

  if (!forecast) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown de Custos Fixos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Custo Fixo Genérico:</span>
          <span className="font-medium">R$ {forecast.breakDown.genericFixedCost.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Despesas Fixas Detalhadas:</span>
          <span className="font-medium">R$ {forecast.breakDown.detailedFixedCost.toFixed(2)}</span>
        </div>

        {forecast.breakDown.totalEmployeeCost > 0 && (
          <div className="flex justify-between text-primary">
            <span className="flex items-center gap-1">
              💼 Custos de Funcionários:
            </span>
            <span className="font-semibold">
              R$ {forecast.breakDown.totalEmployeeCost.toFixed(2)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total Custo Fixo:</span>
          <span className="text-primary">R$ {forecast.breakDown.totalFixedCost.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
