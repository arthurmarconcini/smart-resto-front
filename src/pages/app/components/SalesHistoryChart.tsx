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
           <div className="h-6 w-1/3 bg-slate-200 rounded" />
           <div className="h-4 w-1/4 bg-slate-200 rounded mt-2" />
        </CardHeader>
        <CardContent className="h-[300px]">
           <div className="h-full w-full bg-slate-100 rounded" />
        </CardContent>
      </Card>
    )
  }

  // Find max value for domain
  const maxValue = Math.max(...(data.map(d => d.value) || [0])) * 1.1;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-l-4 border-l-emerald-500">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Histórico de Vendas
                </CardTitle>
                <CardDescription>
                    Comparativo dos últimos 6 meses
                </CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div>
                    Mês Atual
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-200"></div>
                    Meses Anteriores
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                tick={{ fill: '#64748b' }}
                domain={[0, maxValue ? 'auto' : 1000]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number | undefined) => [formatCurrency(Number(value || 0)), 'Vendas']}
              labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isCurrent ? '#10b981' : '#a7f3d0'} // emerald-500 vs emerald-200
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
