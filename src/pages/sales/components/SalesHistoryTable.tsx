import { useState } from "react";
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
import { Eye, Receipt } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SaleType, type Sale } from "@/types/sales";
import { SaleDetailsDialog } from "./SaleDetailsDialog";
import { SaleHistorySkeleton } from "./SaleHistorySkeleton";

interface SalesHistoryTableProps {
  sales: Sale[];
  isLoading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SalesHistoryTable({ sales, isLoading }: SalesHistoryTableProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

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
              <TableHead>Data e Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const isRecent =
                new Date().getTime() - new Date(sale.date).getTime() < 3600000;

              return (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {format(new Date(sale.date), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(sale.date), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          sale.type === SaleType.DAILY_TOTAL
                            ? "secondary"
                            : "default"
                        }
                      >
                        {sale.type === SaleType.DAILY_TOTAL ? "Fechamento" : "PDV"}
                      </Badge>
                      {isRecent && (
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
                    {sale.type === SaleType.ITEMIZED && sale.items ? (
                      <span className="text-sm text-muted-foreground">
                        {sale.items.length} produto(s)
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-semibold">
                      {formatCurrency(Number(sale.totalAmount))}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSale(sale)}
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
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
      />
    </>
  );
}
