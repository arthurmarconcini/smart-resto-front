import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ShoppingBag } from "lucide-react";
import { useSales } from "@/hooks/useSales";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function TodaySummaryCard() {
  const today = new Date();
  const { data: sales, isLoading } = useSales({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const todaySales =
    sales?.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    }) || [];

  const totalToday = todaySales.reduce(
    (acc, sale) => acc + Number(sale.totalAmount),
    0
  );

  return (
    <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Vendas de Hoje
        </CardTitle>
        <TrendingUp className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(totalToday)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <ShoppingBag className="h-3 w-3 mr-1" />
                {todaySales.length} venda(s)
              </Badge>
              {todaySales.length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ● Ativo
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
