import { useState } from "react";
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
import { PointOfSale } from "./components/PointOfSale";
import { DailySalesForm } from "./components/DailySalesForm";
import { SalesHistoryTable } from "./components/SalesHistoryTable";
import { SalesFilters } from "./components/SalesFilters";
import { TodaySummaryCard } from "./components/TodaySummaryCard";
import { useSales, salesKeys } from "@/hooks/useSales";
import { useQueryClient } from "@tanstack/react-query";

export function SalesPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const { data: sales, isLoading, isFetching } = useSales({ month, year });
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            Registro de Vendas
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie suas vendas diárias ou lance pedidos individuais
          </p>
        </div>

        <TodaySummaryCard />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="daily">Fechamento Rápido</TabsTrigger>
          <TabsTrigger value="pos">Venda Detalhada (PDV)</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <SalesFilters
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as vendas do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesHistoryTable sales={sales || []} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <DailySalesForm />
        </TabsContent>

        <TabsContent value="pos">
          <PointOfSale />
        </TabsContent>
      </Tabs>
    </div>
  );
}
