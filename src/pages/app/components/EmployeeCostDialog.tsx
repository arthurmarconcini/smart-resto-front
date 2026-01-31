import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  useCreateEmployeeCost,
  useUpdateEmployeeCost,
} from "@/hooks/useEmployeeCosts";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { EmployeeCost } from "@/types/employee-cost";

const employeeCostSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Cargo é obrigatório"),
  workedDays: z.coerce
    .number()
    .int("Deve ser um número inteiro")
    .min(1, "Mínimo 1 dia")
    .max(31, "Máximo 31 dias"),
  dailyRate: z.coerce
    .number()
    .positive("Valor deve ser positivo")
    .min(0.01, "Valor muito baixo"),
});

type FormValues = z.infer<typeof employeeCostSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeCost | null;
  companyId: string;
}

export function EmployeeCostDialog({
  open,
  onOpenChange,
  employee,
  companyId,
}: Props) {
  const isEditing = !!employee;

  const createMutation = useCreateEmployeeCost(companyId);
  const updateMutation = useUpdateEmployeeCost(companyId);

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeCostSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      role: "",
      workedDays: 30,
      dailyRate: 0,
    },
  });

  // Reset form quando employee muda
  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        role: employee.role,
        workedDays: employee.workedDays,
        dailyRate: employee.dailyRate,
      });
    } else {
      form.reset({
        name: "",
        role: "",
        workedDays: 30,
        dailyRate: 0,
      });
    }
  }, [employee, form]);

  const workedDays = useWatch({control: form.control, name: "workedDays"});
  const dailyRate = useWatch({control: form.control, name: "dailyRate"});
  const monthlyTotal = (workedDays || 0) * (dailyRate || 0);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: employee.id,
          data,
        });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Funcionário cadastrado com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar funcionário");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário. O salário mensal será calculado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo/Função *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cozinheiro, Garçom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workedDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias Trabalhados *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>1-31 dias</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Diária (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salário Mensal Total:</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  R$ {monthlyTotal.toFixed(2)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {workedDays} dias × R$ {dailyRate.toFixed(2)} = R$ {monthlyTotal.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
