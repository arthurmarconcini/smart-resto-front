import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DreChartProps {
  totalRevenue: number;
  baseCost: number;
  employeeCost: number;
  registeredExpenses: number;
  goalRevenue: number;
}

export function DreChart({ totalRevenue, baseCost, employeeCost, registeredExpenses, goalRevenue }: DreChartProps) {
  const safeRevenue = Number(totalRevenue) || 0;
  const safeBase = Number(baseCost) || 0;
  const safeEmployee = Number(employeeCost) || 0;
  const safeRegistered = Number(registeredExpenses) || 0;
  const safeGoal = Number(goalRevenue) || 0;
  
  const totalExpenses = safeBase + safeEmployee + safeRegistered;

  if (safeRevenue === 0 && totalExpenses === 0) {
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

  // Creating separate entries for stacked bars
  // To stack, we use a single object structure for 'Despesas' and one for 'Receitas'
  // using different keys for the stacked segments.
  const chartData = [
    { 
      name: 'Receita', 
      receita: safeRevenue,
      fill: 'var(--success)' 
    },
    { 
      name: 'Despesas', 
      base: safeBase,
      funcionarios: safeEmployee,
      lancadas: safeRegistered,
    },
  ];

  const maxValue = Math.max(safeRevenue, totalExpenses, safeGoal) * 1.15;

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
              <div className="w-3 h-3 rounded-full bg-success"></div>
              Receita
            </div>
            <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              Base
            </div>
            <div className="flex items-center gap-1 text-primary whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Funcionários
            </div>
            <div className="flex items-center gap-1 text-destructive whitespace-nowrap">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              Lançadas
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
            {/* Custom Tooltip formatter helps Recharts display the grouped names nicely */}
            <Tooltip
              cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }}
              wrapperStyle={{ zIndex: 100, outline: 'none' }}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                color: 'var(--foreground)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '8px 12px',
                position: 'relative',
                zIndex: 100
              }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
              formatter={(value, name) => {
                const numVal = Number(value || 0);
                if (numVal === 0) return [undefined, undefined]; // Hide empty segments from tooltip
                
                let label = name;
                if (name === 'receita') label = 'Total Arrecadado';
                else if (name === 'base') label = 'Custo Base Fixo';
                else if (name === 'funcionarios') label = 'Folha de Pagamento';
                else if (name === 'lancadas') label = 'Despesas Adicionais (Fixas+Var)';
                
                return [formatCurrency(numVal), label];
              }}
            />
            {/* The stacked bars setup. Recharts stacks automatically when stackId is the same */}
            <Bar dataKey="receita" stackId="a" fill="var(--success)" radius={[0, 4, 4, 0]} maxBarSize={48} />
            
            <Bar dataKey="base" stackId="b" fill="var(--muted-foreground)" maxBarSize={48} />
            <Bar dataKey="funcionarios" stackId="b" fill="var(--primary)" maxBarSize={48} />
            
            {/* Top segment needs radius to round corners on the right side if it's the last element */}
            <Bar dataKey="lancadas" stackId="b" fill="var(--destructive)" radius={[0, 4, 4, 0]} maxBarSize={48} />
            {safeGoal > 0 && (
              <ReferenceLine x={safeGoal} stroke="var(--color-foreground)" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'Meta', fill: 'var(--color-foreground)', fontSize: 12 }} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
