import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleType, type Sale } from "@/types/sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Receipt, Package, Calendar, DollarSign } from "lucide-react";

interface SaleDetailsDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SaleDetailsDialog({
  sale,
  open,
  onOpenChange,
}: SaleDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Detalhes da Venda
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre a transação
          </DialogDescription>
        </DialogHeader>

        {!sale ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(85vh-8rem)] pr-4">
            <div className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Data e Hora
                  </div>
                  <p className="text-sm font-medium">
                    {format(new Date(sale.date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo de Venda</p>
                  <Badge
                    variant={
                      sale.type === SaleType.DAILY_TOTAL ? "secondary" : "default"
                    }
                  >
                    {sale.type === SaleType.DAILY_TOTAL
                      ? "Fechamento de Caixa"
                      : "Venda Detalhada"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Items */}
              {sale.type === SaleType.ITEMIZED &&
              sale.items &&
              sale.items.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Produtos Vendidos</h4>
                  </div>
                  <div className="space-y-2">
                    {sale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.product.unit} ×{" "}
                            {formatCurrency(Number(item.unitPrice))}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(Number(item.subTotal))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Venda de fechamento de caixa</p>
                  <p className="text-xs">Sem detalhamento de produtos</p>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Valor Total</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(sale.totalAmount))}
                </span>
              </div>

              {/* Informações Técnicas */}
              <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                <p>ID: {sale.id}</p>
                <p>
                  Registrado em:{" "}
                  {format(new Date(sale.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
