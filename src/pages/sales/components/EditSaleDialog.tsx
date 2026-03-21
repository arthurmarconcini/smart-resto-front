import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { useUpdateSale } from "@/hooks/useSales";
import { SaleType, type Sale } from "@/types/sales";

const schema = z.object({
  date: z.date({ message: "A data é obrigatória." }),
  totalAmount: z.coerce
    .number({ message: "Informe um valor numérico." })
    .nonnegative({ message: "O valor deve ser maior ou igual a zero." }),
});

type FormValues = z.infer<typeof schema>;

interface EditSaleDialogProps {
  sale: Sale | null;
  onClose: () => void;
}

export function EditSaleDialog({ sale, onClose }: EditSaleDialogProps) {
  const { mutate: updateSale, isPending } = useUpdateSale();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(),
      totalAmount: 0,
    },
  });

  useEffect(() => {
    if (sale) {
      form.reset({
        date: new Date(sale.date),
        totalAmount: Number(sale.totalAmount),
      });
    }
  }, [sale, form]);

  const onSubmit = (data: FormValues) => {
    if (!sale) return;

    updateSale(
      {
        id: sale.id,
        date: data.date.toISOString(),
        ...(sale.type === SaleType.DAILY_TOTAL ? { totalAmount: data.totalAmount } : {}),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={!!sale} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
          <DialogDescription>
            {sale?.type === SaleType.ITEMIZED
              ? "Para vendas detalhadas, no momento é possível apenas alterar a data. Para modificar produtos, exclua e recrie o pedido."
              : "Atualize os dados do fechamento diário."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sale?.type === SaleType.DAILY_TOTAL && (
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        {...field}
                        value={field.value as number}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
