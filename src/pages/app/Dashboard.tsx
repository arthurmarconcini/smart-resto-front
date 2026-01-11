import { useEffect, useState } from "react";
import { format, addDays, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Calendar,
  TrendingUp,
} from "lucide-react";

import { api } from "@/lib/api";
import type { Company, Expense, Revenue } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SetupBanner } from "@/components/app/SetupBanner";
import { toast } from "sonner";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [companyRes, expensesRes, revenueRes] = await Promise.all([
          api.get<Company>("/auth/me"),
          api.get<Expense[]>("/finance/expenses"),
          api.get<Revenue[]>("/revenue"),
        ]);

        const companyData = companyRes.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCompany((companyData as any).company || companyData);
        setExpenses(expensesRes.data || []);

        // Filtra a receita do mês atual
        const currentMonth = format(new Date(), "yyyy-MM");
        const revenues = revenueRes.data || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentRevenue = revenues.find((r: any) => r.month === currentMonth) || null;
        setRevenue(currentRevenue);

      } catch (error) {
        console.error("Falha ao carregar dados do dashboard", error);
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // --- Cálculos ---

  // 1. Ponto de Equilíbrio
  const monthlyFixedCost = company?.monthlyFixedCost || 0;
  const totalRevenue = revenue?.totalRevenue || 0;
  const breakEvenPercentage = monthlyFixedCost > 0
    ? (totalRevenue / monthlyFixedCost) * 100
    : 0;

  const isProfit = breakEvenPercentage >= 100;

  // 2. Previsão (Despesas Urgentes)
  const today = new Date();
  const next7Days = addDays(today, 7);

  const urgentExpenses = expenses
    .filter(e => {
      // Filtra apenas pendentes
      if (e.status !== 'PENDING') return false;

      const dateStr = e.dueDate || e.date;
      if (!dateStr) return false;

      const dueDate = parseISO(dateStr);
      // Verifica se está no passado (vencida) ou nos próximos 7 dias
      return isBefore(dueDate, next7Days);
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.date).getTime();
      const dateB = new Date(b.dueDate || b.date).getTime();
      return dateA - dateB;
    })
    .slice(0, 3); // Top 3

  const totalUrgentValue = urgentExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 3. DRE (Dados do Gráfico)
  const currentMonthExpenses = expenses.filter(e => {
    const expenseDate = parseISO(e.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear();
  });

  const totalMonthlyExpenses = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0) + monthlyFixedCost;

  const chartData = [
    { name: 'Receita', value: totalRevenue, fill: '#10b981' }, // emerald-500
    { name: 'Despesas', value: totalMonthlyExpenses, fill: '#ef4444' }, // red-500
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen">Carregando dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <SetupBanner />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard Financeiro
            </h1>
            <p className="text-muted-foreground">
              Visão geral da saúde financeira do mês de {format(new Date(), "MMMM", { locale: ptBR })}.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              {format(new Date(), "MMM, yyyy", { locale: ptBR })}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card Ponto de Equilíbrio */}
          <Card className={`${isProfit ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'} shadow-sm`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ponto de Equilíbrio
              </CardTitle>
              <CardDescription>Cobrir custos fixos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold">
                    {Math.min(100, Math.round(breakEvenPercentage))}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    de {formatCurrency(monthlyFixedCost)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, breakEvenPercentage)}
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground pt-1">
                  {isProfit
                    ? "Parabéns! Você já cobriu seus custos fixos."
                    : `Faltam ${formatCurrency(monthlyFixedCost - totalRevenue)} para cobrir custos.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DRE Simplificado (Gráfico) */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>DRE Simplificado</CardTitle>
                  <CardDescription>Receita vs Despesas Totais (Fixo + Variável)</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    Receita
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Despesas
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [formatCurrency(Number(value || 0)), undefined]}
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {
                      chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Card Previsão de Caixa (Alertas) */}
          <Card className="shadow-sm md:col-span-2 lg:col-span-3 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                    Contas a Pagar (Próximos 7 dias)
                  </CardTitle>
                  <CardDescription>
                    Fique atento aos prazos para evitar juros.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-muted-foreground">Total a pagar</span>
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalUrgentValue)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {urgentExpenses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                  <Banknote className="h-10 w-10 mb-2 opacity-20" />
                  Nenhuma conta pendente para os próximos 7 dias. 🎉
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urgentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          {expense.dueDate
                            ? format(parseISO(expense.dueDate), "dd/MM/yyyy")
                            : format(parseISO(expense.date), "dd/MM/yyyy")
                          }
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 w-fit text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pendente
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {urgentExpenses.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => window.location.href = '/expenses'}>
                    Ver todas as despesas
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
