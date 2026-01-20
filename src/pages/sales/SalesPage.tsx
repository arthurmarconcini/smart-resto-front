import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PointOfSale } from "./components/PointOfSale";
import { DailySalesForm } from "./components/DailySalesForm";
import { useSales } from "@/hooks/useSales";
import { SaleType } from "@/types/sales";
import { format } from "date-fns";

export function SalesPage() {
  const { data: sales, isLoading } = useSales();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Registro de Vendas</h2>
        <p className="text-muted-foreground">
          Gerencie suas vendas diárias ou lance pedidos individuais.
        </p>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pos">Venda Detalhada (PDV)</TabsTrigger>
          <TabsTrigger value="daily">Fechamento Rápido</TabsTrigger>
          <TabsTrigger value="history">Histórico Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <PointOfSale />
        </TabsContent>

        <TabsContent value="daily">
          <DailySalesForm />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Visualize as vendas registradas recentemente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-4 text-center">Carregando...</div>
              ) : !sales || sales.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma venda registrada neste mês.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.date), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.type === SaleType.DAILY_TOTAL
                                ? "secondary"
                                : "default"
                            }
                          >
                            {sale.type === SaleType.DAILY_TOTAL
                              ? "Fechamento Caixa"
                              : "PDV"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(sale.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
