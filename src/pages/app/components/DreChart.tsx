import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DreChartProps {
  totalRevenue: number;
  totalMonthlyExpenses: number;
  goalRevenue: number;
}

export function DreChart({ totalRevenue, totalMonthlyExpenses, goalRevenue }: DreChartProps) {
  const safeRevenue = Number(totalRevenue) || 0;
  const safeExpenses = Number(totalMonthlyExpenses) || 0;
  const safeGoal = Number(goalRevenue) || 0;

  if (safeRevenue === 0 && safeExpenses === 0) {
    return (
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle>DRE Simplificado</CardTitle>
          <CardDescription>Nenhum dado disponível para o período</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Configure suas vendas e despesas</p>
            <p className="text-sm text-muted-foreground">para visualizar o DRE</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Receita', value: safeRevenue, fill: 'var(--color-primary)' },
    { name: 'Despesas', value: safeExpenses, fill: 'var(--color-destructive)' },
  ];

  const maxValue = Math.max(safeRevenue, safeExpenses, safeGoal) * 1.2;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="shadow-sm lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>DRE Simplificado</CardTitle>
            <CardDescription>Receita vs Despesas Totais (Fixo + Variável)</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Receita
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              Despesas
            </div>
            {safeGoal > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-[2px] bg-foreground border-dashed border-t border-foreground"></div>
                <span className="text-foreground">Meta ({formatCurrency(safeGoal)})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis type="number" hide domain={[0, maxValue ? maxValue : 'auto']} />
            <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }}
              contentStyle={{ 
                backgroundColor: 'var(--color-popover)', 
                borderColor: 'var(--color-border)', 
                borderRadius: 'var(--radius)', 
                color: 'var(--color-popover-foreground)' 
              }}
              formatter={(value) => [formatCurrency(Number(value || 0)), undefined]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
              {
                chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))
              }
            </Bar>
            {safeGoal > 0 && (
              <ReferenceLine x={safeGoal} stroke="var(--color-foreground)" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'Meta', fill: 'var(--color-foreground)', fontSize: 12 }} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
