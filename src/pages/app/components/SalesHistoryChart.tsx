import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSalesHistory } from "@/hooks/useSales";
import { TrendingUp } from "lucide-react";

export function SalesHistoryChart() {
  const { data, isLoading } = useSalesHistory();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-l-4 border-l-emerald-500 animate-pulse">
        <CardHeader>
           <div className="h-6 w-1/3 bg-muted rounded" />
           <div className="h-4 w-1/4 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px]">
           <div className="h-full w-full bg-muted/20 rounded" />
        </CardContent>
      </Card>
    )
  }

  // Find max value for domain
  const maxValue = Math.max(...(data.map(d => d.value) || [0])) * 1.1;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-md border-primary/20 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-xl flex items-center gap-2 font-heading">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Histórico de Vendas
                </CardTitle>
                <CardDescription>
                    Comparativo dos últimos 6 meses
                </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    Mês Atual
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-muted"></div>
                    Meses Anteriores
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--color-muted-foreground)' }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: 'var(--color-muted-foreground)' }}
                domain={[0, maxValue ? 'auto' : 1000]}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }}
              contentStyle={{ 
                backgroundColor: 'var(--color-popover)', 
                borderColor: 'var(--color-border)', 
                borderRadius: 'var(--radius)', 
                color: 'var(--color-popover-foreground)' 
              }}
              formatter={(value: number | undefined) => [formatCurrency(Number(value || 0)), 'Vendas']}
              labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isCurrent ? 'var(--color-primary)' : 'var(--color-muted)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
