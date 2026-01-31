import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEmployeeCost, useUpdateEmployeeCost } from "@/hooks/useEmployeeCosts";
import { useAuth } from "@/store/auth-store";
import { type EmployeeCost } from "@/types/employee-cost";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função/Cargo é obrigatório"),
  workedDays: z.number().min(1).max(31, "Dias trabalhados inválidos (1-31)"),
  dailyRate: z.number().min(0, "O valor da diária deve ser positivo"),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployeeCostFormProps {
  initialData?: EmployeeCost;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeCostForm({ initialData, onSuccess, onCancel }: EmployeeCostFormProps) {
  const { company } = useAuth();
  const companyId = company?.id ?? "";

  const { mutateAsync: createEmployeeCost, isPending: isCreating } = useCreateEmployeeCost(companyId);
  const { mutateAsync: updateEmployeeCost, isPending: isUpdating } = useUpdateEmployeeCost(companyId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "",
      workedDays: initialData?.workedDays || 22,
      dailyRate: initialData?.dailyRate || 0,
    },
  });

  const isSubmitting = isCreating || isUpdating;

  async function onSubmit(data: FormValues) {
    try {
      if (initialData) {
        await updateEmployeeCost({ id: initialData.id, data });
      } else {
        await createEmployeeCost(data);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Funcionário</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
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
              <FormLabel>Função / Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Garçom, Cozinheiro..." {...field} />
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
                <FormLabel>Dias Trabalhados</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dailyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Diária (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? "Salvando..." : "Adicionando...") : (initialData ? "Salvar Alterações" : "Adicionar Funcionário")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
