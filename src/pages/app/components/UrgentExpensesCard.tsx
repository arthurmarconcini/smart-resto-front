import { useNavigate } from "react-router-dom";
import { format, addDays, isBefore } from "date-fns";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
} from "lucide-react";
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
import { ExpenseStatus, type Expense } from "@/types/finance";

interface UrgentExpensesCardProps {
  expenses: Expense[];
}

export function UrgentExpensesCard({ expenses }: UrgentExpensesCardProps) {
  const navigate = useNavigate();
  const today = new Date();
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="shadow-sm md:col-span-2 lg:col-span-3 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Contas a Pagar (Próximos 7 dias)
            </CardTitle>
            <CardDescription>
              Fique atento aos prazos para evitar juros.
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="block text-sm text-muted-foreground">Total a pagar</span>
            <span className="block text-2xl font-bold font-heading text-foreground">
              {formatCurrency(totalUrgentValue)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {urgentExpenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent" onClick={() => navigate('/dashboard/expenses')}>
                 <Banknote className="h-10 w-10 mb-2 opacity-20" />
            </Button>
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
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning/20 text-warning w-fit text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
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
  );
}
