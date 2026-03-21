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
import { SaleType } from "@/types/sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Receipt, Calendar, DollarSign, FileSpreadsheet, Trash, Edit } from "lucide-react";
import type { DayGroup } from "./SalesHistoryTable";
import { useDeleteSale } from "@/hooks/useSales";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Sale } from "@/types/sales";
import { EditSaleDialog } from "./EditSaleDialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SaleDetailsDialogProps {
  dayGroup: DayGroup | null;
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
  dayGroup,
  open,
  onOpenChange,
}: SaleDetailsDialogProps) {
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();

  const handleDelete = () => {
    if (saleToDelete) {
      deleteSale(saleToDelete.id, {
        onSuccess: () => setSaleToDelete(null),
      });
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Resumo do Dia
          </DialogTitle>
          <DialogDescription>
            Detalhamento de todas as receitas e operações registradas neste dia.
          </DialogDescription>
        </DialogHeader>

        {!dayGroup ? (
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
                    Data
                  </div>
                  <p className="text-sm font-medium capitalize">
                    {format(dayGroup.displayDate, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Composição</p>
                  <p className="text-sm font-medium">
                    {dayGroup.totalSales} Registro(s)
                    {dayGroup.itemizedCount > 0 && ` (${dayGroup.itemsCount} itens)`}
                  </p>
                </div>
              </div>

              {/* Total do Dia */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Total do Dia</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(dayGroup.totalAmount)}
                </span>
              </div>

              <Separator />

              {/* Lista Detalhada de Transações do Dia */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <h4 className="font-semibold text-foreground">Transações</h4>
                </div>
                
                <Accordion type="multiple" className="w-full">
                  {dayGroup.sales.map((sale) => (
                    <AccordionItem value={`sale-${sale.id}`} key={sale.id} className="border border-border rounded-lg mb-2 overflow-hidden px-4 border-b!">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                sale.type === SaleType.DAILY_TOTAL
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {sale.type === SaleType.DAILY_TOTAL ? "Fechamento" : "PDV"}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">
                              {format(new Date(sale.date), "HH:mm")}
                            </span>
                          </div>
                          <span className="font-semibold px-4">
                            {formatCurrency(Number(sale.totalAmount))}
                          </span>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="pt-2 pb-4">
                        <div className="flex justify-end gap-2 mb-4 px-2">
                          <Button size="sm" variant="outline" onClick={() => setSaleToEdit(sale)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setSaleToDelete(sale)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>

                        {sale.type === SaleType.ITEMIZED && sale.items && sale.items.length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {sale.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 bg-muted/30 border rounded transition-colors text-sm"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity} {item.product.unit} ×{" "}
                                    {formatCurrency(Number(item.unitPrice))}
                                  </p>
                                </div>
                                <p className="font-semibold text-foreground">
                                  {formatCurrency(Number(item.subTotal))}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">Venda agregada / Fechamento de caixa</p>
                            <p className="text-xs">Identificador único: {sale.id}</p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!saleToDelete} onOpenChange={(open) => !open && setSaleToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Venda?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita. 
            O estoque dos produtos será revertido e o faturamento recalculado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <EditSaleDialog 
      sale={saleToEdit} 
      onClose={() => setSaleToEdit(null)} 
    />
    </>
  );
}
