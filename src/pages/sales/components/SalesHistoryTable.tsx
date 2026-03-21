import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Receipt, FileSpreadsheet } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SaleType, type Sale } from "@/types/sales";
import { SaleDetailsDialog } from "./SaleDetailsDialog";
import { SaleHistorySkeleton } from "./SaleHistorySkeleton";

interface SalesHistoryTableProps {
  sales: Sale[];
  isLoading: boolean;
}

export interface DayGroup {
  dateStr: string;
  displayDate: Date;
  totalAmount: number;
  totalSales: number;
  itemizedCount: number;
  dailyTotalCount: number;
  itemsCount: number;
  sales: Sale[];
  hasRecent: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SalesHistoryTable({ sales, isLoading }: SalesHistoryTableProps) {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Group sales by day
  const groupedSales = useMemo(() => {
    if (!sales) return [];

    const groups = new Map<string, DayGroup>();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.date);
      const startOfSaleDay = startOfDay(saleDate);
      const dateStr = startOfSaleDay.toISOString();
      const isRecent = new Date().getTime() - saleDate.getTime() < 3600000;

      if (!groups.has(dateStr)) {
        groups.set(dateStr, {
          dateStr,
          displayDate: startOfSaleDay,
          totalAmount: 0,
          totalSales: 0,
          itemizedCount: 0,
          dailyTotalCount: 0,
          itemsCount: 0,
          sales: [],
          hasRecent: false,
        });
      }

      const group = groups.get(dateStr)!;
      group.sales.push(sale);
      group.totalSales += 1;
      group.totalAmount += Number(sale.totalAmount);
      
      if (sale.type === SaleType.ITEMIZED) {
        group.itemizedCount += 1;
        if (sale.items) {
          group.itemsCount += sale.items.length;
        }
      } else {
        group.dailyTotalCount += 1;
      }
      
      if (isRecent) group.hasRecent = true;
    });

    // Sort descending by date
    return Array.from(groups.values()).sort(
      (a, b) => b.displayDate.getTime() - a.displayDate.getTime()
    );
  }, [sales]);

  const selectedDayGroup = useMemo(() => {
    if (!selectedDateStr) return null;
    return groupedSales.find(g => g.dateStr === selectedDateStr) || null;
  }, [selectedDateStr, groupedSales]);

  if (isLoading) {
    return <SaleHistorySkeleton />;
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="py-12 text-center border rounded-lg bg-muted/20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Receipt className="h-12 w-12 opacity-20" />
          <p className="font-medium">Nenhuma venda registrada</p>
          <p className="text-sm">
            Use as abas acima para registrar sua primeira venda
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Resumo do Dia</TableHead>
              <TableHead>Itens / Lançamentos</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedSales.map((group) => {
              return (
                <TableRow key={group.dateStr}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium capitalize">
                        {format(group.displayDate, "dd 'de' MMMM", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {format(group.displayDate, "EEEE", { locale: ptBR })}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {group.dailyTotalCount > 0 && (
                        <Badge variant="secondary">Fechamento Manual</Badge>
                      )}
                      {group.itemizedCount > 0 && (
                        <Badge variant="default" className="gap-1">
                          <FileSpreadsheet className="h-3 w-3" />
                         {group.itemizedCount} Pedido(s)
                        </Badge>
                      )}
                      {group.hasRecent && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600/30"
                        >
                          Recente
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{group.totalSales} registro(s) no dia</p>
                      {group.itemsCount > 0 && (
                        <p className="text-xs">{group.itemsCount} produtos vendidos</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-semibold text-lg text-foreground">
                      {formatCurrency(group.totalAmount)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDateStr(group.dateStr)}
                      className="hover:bg-primary/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <SaleDetailsDialog
        dayGroup={selectedDayGroup}
        open={!!selectedDateStr}
        onOpenChange={(open) => !open && setSelectedDateStr(null)}
      />
    </>
  );
}
