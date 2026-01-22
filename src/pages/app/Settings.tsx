import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/store/auth-store";
import { api } from "@/lib/api";
import type { Company } from "@/types";
import {
  Banknote,
  Calculator,
  Coins,
  Percent,
  Store,
  Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const settingsSchema = z.object({
  // Grupo 1: Estrutura de Custos (Macro)
  monthlyFixedCost: z.coerce.number()
    .min(0, "O valor deve ser positivo"),
  targetProfitValue: z.coerce.number()
    .min(0, "O valor deve ser positivo"),

  // Grupo 2: Motor de Precificação (Micro)
  defaultTaxRate: z.coerce.number()
    .min(0, "A taxa deve ser positiva")
    .max(100, "A taxa não pode ser superior a 100%"),
  defaultCardFee: z.coerce.number()
    .min(0, "A taxa deve ser positiva")
    .max(100, "A taxa não pode ser superior a 100%"),
  desiredProfit: z.coerce.number()
    .min(0, "A margem deve ser positiva")
    .max(1000, "A margem de lucro parece excessiva (máx 1000%)"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { company, updateCompany, isCompanyConfigured } = useAuth();
  const isConfigured = isCompanyConfigured();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      monthlyFixedCost: Number(company?.monthlyFixedCost ?? 0),
      targetProfitValue: Number(company?.targetProfitValue ?? 0),
      defaultTaxRate: Number(company?.defaultTaxRate ?? 0),
      defaultCardFee: Number(company?.defaultCardFee ?? 0),
      desiredProfit: Number(company?.desiredProfit ?? 0),
    },
  });

  // Reset form when company data is loaded/updated
  useEffect(() => {
    if (company) {
      form.reset({
        monthlyFixedCost: Number(company.monthlyFixedCost ?? 0),
        targetProfitValue: Number(company.targetProfitValue ?? 0),
        defaultTaxRate: Number(company.defaultTaxRate ?? 0),
        defaultCardFee: Number(company.defaultCardFee ?? 0),
        desiredProfit: Number(company.desiredProfit ?? 0),
      });
    }
  }, [company, form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      const { data: updatedCompany } = await api.put<Company>("/companies/settings", data);

      updateCompany(updatedCompany);
      toast.success("Configurações salvas com sucesso!");

      // If it was the first setup, redirect to dashboard
      if (!isConfigured) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = apiError.response?.data?.message || apiError.message || "Erro desconhecido";
      toast.error(`Erro ao salvar: ${errorMessage}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          Configurações do Restaurante
        </h1>
        <p className="text-muted-foreground text-lg">
          Personalize as regras financeiras para automatizar sua precificação.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <Card className="border-l-4 border-l-primary/50 shadow-md">
            <CardHeader className="bg-muted/10">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Estrutura de Custos (Macro)</CardTitle>
              </div>
              <CardDescription>
                Defina seus custos fixos e quanto você deseja colocar no bolso (em reais) no final do mês.
                Estes valores são a base para calcular seu Ponto de Equilíbrio.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="monthlyFixedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Custo Fixo Base (Estático)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Ex: 5000.00"
                          step="0.01"
                          className="pl-9 h-11 text-lg"
                          {...field}
                          value={(field.value as string | number) ?? ''}

                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Informe aqui apenas os custos invariáveis (ex: Aluguel) que você NÃO pretende lançar manualmente todo mês na tela de Financeiro. Este valor será somado às despesas fixas lançadas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetProfitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-primary font-semibold flex items-center gap-2">
                      Lucro Alvo Mensal (R$)
                      <Target className="h-4 w-4" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Coins className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                        <Input
                          type="number"
                          placeholder="Ex: 10000.00"
                          step="0.01"
                          className="pl-9 h-11 text-lg border-primary/30 focus-visible:ring-primary/50 bg-primary/5"
                          {...field}
                          value={(field.value as string | number) ?? ''}

                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Quanto de <strong>lucro líquido</strong> você quer gerar por mês?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-xl">Motor de Precificação (Micro)</CardTitle>
              </div>
              <CardDescription>
                Configure os multiplicadores padrão. Estes valores serão aplicados automaticamente
                ao sugerir preços para novos pratos.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <FormField
                  control={form.control}
                  name="defaultTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impostos (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Ex: 8.0"
                            step="0.1"
                            className="pl-9"
                            {...field}
                            value={(field.value as string | number) ?? ''}

                          />
                        </div>
                      </FormControl>
                      <FormDescription>Simples Nacional, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultCardFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Cartão Média (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Ex: 3.5"
                            step="0.1"
                            className="pl-9"
                            {...field}
                            value={(field.value as string | number) ?? ''}

                          />
                        </div>
                      </FormControl>
                      <FormDescription>Média das taxas (Créd/Déb/Ticket)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="desiredProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margem Lucro Padrão (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Ex: 20.0"
                            step="0.1"
                            className="pl-9"
                            {...field}
                            value={(field.value as string | number) ?? ''}

                          />
                        </div>
                      </FormControl>
                      <FormDescription>Margem de lucro por item</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto text-base px-8"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Salvando Alterações..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
