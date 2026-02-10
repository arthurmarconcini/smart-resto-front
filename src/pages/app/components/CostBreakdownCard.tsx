import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFinanceForecast } from "@/hooks/useFinance";
import { Banknote, FileText, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CostBreakdownCardProps {
  month: number;
  year: number;
}

export function CostBreakdownCard({ month, year }: CostBreakdownCardProps) {
  const { data: forecast, isLoading, error } = useFinanceForecast(month, year);
  const [showEmployees, setShowEmployees] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-l-4 border-l-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-destructive">
            Erro ao carregar custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!forecast?.breakDown) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            Composição dos Custos Fixos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum custo configurado para este período
          </p>
        </CardContent>
      </Card>
    );
  }

  const { breakDown } = forecast;
  const employeesBreakdown = forecast.fixedCostsBreakdown;
  const hasEmployees = employeesBreakdown && employeesBreakdown.employees.length > 0;

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
          <div className="space-y-2">
            <div 
              className={`flex justify-between items-center text-primary ${hasEmployees ? 'cursor-pointer hover:bg-muted/20 -mx-2 px-2 py-1 rounded transition-colors' : ''}`}
              onClick={() => hasEmployees && setShowEmployees(!showEmployees)}
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Custos de Funcionários
                {hasEmployees && (
                  showEmployees 
                    ? <ChevronUp className="h-4 w-4" /> 
                    : <ChevronDown className="h-4 w-4" />
                )}
              </span>
              <span className="font-semibold">
                {formatCurrency(breakDown.totalEmployeeCost)}
              </span>
            </div>

            {/* Lista detalhada de funcionários */}
            {showEmployees && hasEmployees && (
              <div className="ml-6 space-y-2 border-l-2 border-primary/30 pl-3 py-1">
                {employeesBreakdown.employees.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="flex justify-between items-start text-sm gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {employee.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.role} • {employee.workedDays} dias × {formatCurrency(employee.dailyRate)}
                      </p>
                    </div>
                    <span className="font-medium text-primary whitespace-nowrap">
                      {formatCurrency(employee.monthlyCost)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
