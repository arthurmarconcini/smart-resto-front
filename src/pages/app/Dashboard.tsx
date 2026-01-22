import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Calendar,
} from "lucide-react";

import { api } from "@/lib/api";
import { ExpenseStatus, type Expense } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { FinanceForecastCard } from "@/pages/finance/components/FinanceForecastCard";
import { useFinanceForecast } from "@/hooks/useFinance";
import { useSales } from "@/hooks/useSales";

export function DashboardPage() {
  const navigate = useNavigate(); // Hook
  const [loading, setLoading] = useState(true);
  // const [company, setCompany] = useState<Company | null>(null); // Removed
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [expensesRes] = await Promise.all([
          // api.get<Company>("/auth/me"), // Removed
          api.get<Expense[]>("/finance/expenses"),
        ]);

        // const companyData = companyRes.data;
        // setCompany((companyData as any).company || companyData);
        setExpenses(expensesRes.data || []);

      } catch (error) {
        console.error("Falha ao carregar dados do dashboard", error);
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Hook Forecast
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const { data: forecast } = useFinanceForecast(currentMonth, currentYear);
  const { data: sales } = useSales({ month: currentMonth, year: currentYear });

  const totalRevenue = sales?.reduce((acc, curr) => acc + Number(curr.totalAmount), 0) || 0;

  // 2. Previsão (Despesas Urgentes)
  const next7Days = addDays(today, 7);

  const urgentExpenses = expenses
    .filter(e => {
      // Filtra apenas pendentes
      if (e.status !== ExpenseStatus.PENDING) return false;

      const dateStr = e.dueDate;
      if (!dateStr) return false;

      const dueDate = new Date(dateStr)
      // Verifica se está no passado (vencida) ou nos próximos 7 dias
      return isBefore(dueDate, next7Days);
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    })
    .slice(0, 3); // Top 3

  const totalUrgentValue = urgentExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 3. DRE (Dados do Gráfico - Usa Forecast API)
  const totalMonthlyExpenses = (forecast?.breakDown?.totalFixedCost || 0) + (forecast?.breakDown?.variableExpenses || 0);
  const goalRevenue = forecast?.targets?.goalRevenue || 0;

  const chartData = [
    { name: 'Receita', value: totalRevenue, fill: '#10b981' }, // emerald-500
    { name: 'Despesas', value: totalMonthlyExpenses, fill: '#ef4444' }, // red-500
  ];

  // Garante que o gráfico tenha escala para mostrar a meta
  const maxValue = Math.max(totalRevenue, totalMonthlyExpenses, goalRevenue) * 1.2;

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


          {/* Card Ponto de Equilíbrio (Refatorado para usar Hook Híbrido) */}
          <FinanceForecastCard 
            month={new Date().getMonth()} 
            year={new Date().getFullYear()} 
          />

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
                  {goalRevenue > 0 && (
                     <div className="flex items-center gap-1">
                        <div className="w-4 h-[2px] bg-blue-500 border-dashed border-t border-blue-500"></div>
                        <span className="text-blue-500">Meta ({formatCurrency(goalRevenue)})</span>
                     </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide domain={[0, maxValue ? maxValue : 'auto']} />
                  <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatCurrency(Number(value || 0)), undefined]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {
                      chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                  {goalRevenue > 0 && (
                    <ReferenceLine x={goalRevenue} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} label={{ position: 'top', value: 'Meta', fill: '#3b82f6', fontSize: 12 }} />
                  )}
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
                            ? format(new Date(expense.dueDate), "dd/MM/yyyy")
                            : "-"
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/dashboard/expenses')}>
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
