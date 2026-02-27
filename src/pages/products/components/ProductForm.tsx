import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/store/auth-store";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductUnit, type Product } from "@/types/product";
import { PRODUCT_UNIT_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Calculator, Info, AlertTriangle, TrendingUp } from "lucide-react";

// --- Schema ---
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  unit: z.nativeEnum(ProductUnit),
  stock: z.coerce.number().min(0, "Estoque deve ser positivo"),
  costPrice: z.coerce.number().min(0.01, "Custo deve ser maior que 0"),
  salePrice: z.coerce.number().min(0.01, "Preço de venda deve ser maior que 0"),
  markup: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { company } = useAuth();
  const { data: categories } = useCategories();
  
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const isEditing = !!initialData;
  const isLoading = isCreating || isUpdating;

  // Flag: se o usuário editou manualmente o preço de venda
  // Produto existente inicia como true (respeitar preço salvo)
  const [userSetPrice, setUserSetPrice] = useState(isEditing);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      unit: initialData?.unit || ProductUnit.UN,
      stock: initialData?.stock || 0,
      costPrice: initialData?.costPrice || 0,
      salePrice: initialData?.salePrice || 0,
      markup: initialData?.markup || 0,
    },
  });

  const costPrice = useWatch({ control: form.control, name: "costPrice" });
  const salePrice = useWatch({ control: form.control, name: "salePrice" });
  const { setValue } = form;

  // --- Taxas da empresa ---
  const taxRate = (company?.defaultTaxRate || 0) / 100;
  const cardFee = (company?.defaultCardFee || 0) / 100;
  const margin = (company?.desiredProfit || 0) / 100;

  // --- Cálculos ---
  const denominator = 1 - (taxRate + cardFee + margin);
  const suggestedPrice = costPrice > 0 && denominator > 0
    ? costPrice / denominator
    : costPrice > 0 ? costPrice * (1 + taxRate + cardFee + margin) : 0;

  // Preço mínimo (break-even, sem lucro)
  const breakEvenDenominator = 1 - (taxRate + cardFee);
  const breakEvenPrice = costPrice > 0 && breakEvenDenominator > 0
    ? costPrice / breakEvenDenominator
    : costPrice;

  // Métricas reais baseadas no salePrice atual
  const taxes = salePrice * (taxRate + cardFee);
  const netRevenue = salePrice - taxes;
  const netProfit = netRevenue - costPrice;
  const realMarkup = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;
  const realMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

  const isBelowBreakEven = salePrice > 0 && salePrice < breakEvenPrice;
  const isBelowSuggested = salePrice > 0 && salePrice < suggestedPrice && !isBelowBreakEven;

  // --- Smart Pricing: auto-calcula salePrice somente se o usuário NÃO editou ---
  useEffect(() => {
    if (!company || !costPrice || costPrice <= 0) return;
    if (userSetPrice) return;

    setValue("salePrice", Number(suggestedPrice.toFixed(2)));
  }, [costPrice, company, setValue, userSetPrice, suggestedPrice]);

  // --- Handlers ---
  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    setUserSetPrice(true);
    fieldOnChange(e);
  };

  const handleUseSuggested = () => {
    setUserSetPrice(false);
    setValue("salePrice", Number(suggestedPrice.toFixed(2)));
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (!company) {
        toast.error("Erro: Empresa não identificada.");
        return;
      }

      const payload = {
        ...values,
        companyId: company.id,
        markup: Number(realMarkup.toFixed(2)),
      };

      if (isEditing && initialData) {
        await updateProduct({ id: initialData.id, data: payload });
        toast.success("Produto atualizado!");
      } else {
        await createProduct(payload);
        toast.success("Produto criado!");
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto.");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Hambúrguer Clássico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="UN" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ProductUnit).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {PRODUCT_UNIT_LABELS[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
             control={form.control}
             name="description"
             render={({ field }) => (
                <FormItem>
                   <FormLabel>Descrição (Opcional)</FormLabel>
                   <FormControl>
                      <Input placeholder="Ingredientes, detalhes..." {...field} /> 
                   </FormControl>
                   <FormMessage />
                </FormItem>
             )}
        />
        
        <div className="flex gap-4">
             <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Estoque Atual</FormLabel>
                      <FormControl>
                         <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
             />
        </div>

        {/* Pricing Section */}
        <div className="bg-muted/20 p-4 rounded-lg border space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Precificação Inteligente
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Custo de Aquisição (R$)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0,00" 
                                {...field} 
                            />
                        </FormControl>
                        <FormDescription>Quanto você paga.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preço de Venda (R$)</FormLabel>
                        <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0,00" 
                              {...field} 
                              onChange={(e) => handleSalePriceChange(e, field.onChange)}
                            />
                        </FormControl>
                        <FormDescription>
                          {userSetPrice ? (
                            <button
                              type="button"
                              onClick={handleUseSuggested}
                              className="text-primary hover:underline cursor-pointer text-xs"
                            >
                              Usar preço sugerido: {formatCurrency(suggestedPrice)}
                            </button>
                          ) : (
                            "Calculado automaticamente."
                          )}
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Preço mínimo (break-even) */}
            {costPrice > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <Info className="h-3 w-3 shrink-0" />
                <span>
                  Preço mínimo (cobrir custos + taxas): <strong className="text-foreground">{formatCurrency(breakEvenPrice)}</strong>
                  {' '}| Preço sugerido (com margem de {(margin * 100).toFixed(0)}%): <strong className="text-primary">{formatCurrency(suggestedPrice)}</strong>
                </span>
              </div>
            )}
            
            {/* Profit Feedback Card */}
            {costPrice > 0 && salePrice > 0 && (
                <div className={`text-sm p-3 rounded border ${
                  isBelowBreakEven 
                    ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                    : isBelowSuggested 
                      ? 'bg-primary/10 border-primary/30 text-primary-foreground'
                      : 'bg-success/10 border-success/30 text-success'
                }`}>
                    <div className="flex justify-between items-center font-medium">
                        <span className="flex items-center gap-1">
                          {isBelowBreakEven ? (
                            <><AlertTriangle className="h-4 w-4" /> Prejuízo Operacional</>
                          ) : isBelowSuggested ? (
                            <><Info className="h-4 w-4" /> Abaixo da Margem Desejada</>
                          ) : (
                            <><TrendingUp className="h-4 w-4" /> Lucro Líquido Real</>
                          )}
                        </span>
                        <span>{formatCurrency(netProfit)}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-2 text-xs opacity-90 border-t border-dashed border-current/20 pt-2">
                         <div className="flex justify-between">
                            <span>Impostos e Taxas ({((taxRate + cardFee) * 100).toFixed(1)}%):</span>
                            <span>- {formatCurrency(taxes)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Margem Líquida:</span>
                            <span>{realMargin.toFixed(2)}%</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Markup:</span>
                            <span>{realMarkup.toFixed(2)}%</span>
                        </div>
                    </div>

                    {isBelowBreakEven && (
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold">
                            <AlertTriangle className="h-3 w-3" />
                            Cuidado: Você perde dinheiro a cada venda! Aumente o preço para pelo menos {formatCurrency(breakEvenPrice)}.
                        </div>
                    )}
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onSuccess?.()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Produto"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
