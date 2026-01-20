import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useCreateSale } from "@/hooks/useSales";
import { SaleType } from "@/types/sales";

const schema = z.object({
  date: z.date({ message: "A data é obrigatória." }),
  totalAmount: z.coerce
    .number({ message: "Informe um valor numérico." })
    .positive({ message: "O valor deve ser positivo." }),
});

type FormValues = z.infer<typeof schema>;

export function DailySalesForm() {
  const { mutate: createSale, isPending } = useCreateSale();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(),
      totalAmount: 0,
    },
  });

  function onSubmit(data: FormValues) {
    createSale(
      {
        date: data.date.toISOString(),
        totalAmount: data.totalAmount,
        type: SaleType.DAILY_TOTAL,
      },
      {
        onSuccess: () => {
          toast.success("Sucesso!", {
            description: "Venda diária registrada com sucesso.",
          });
          form.reset({
            date: new Date(),
            totalAmount: 0,
          });
        },
        onError: () => {
          toast.error("Erro", {
            description: "Ocorreu um erro ao registrar a venda.",
          });
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fechamento de Caixa Diário</CardTitle>
        <CardDescription>
          Registre o valor total das vendas do dia.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...field}
                      value={field.value === 0 ? "" : (field.value as string | number)} 
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Fechamento"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
