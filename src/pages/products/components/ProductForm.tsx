import { useEffect } from "react";
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
import { Loader2, Calculator, Info } from "lucide-react";

// --- Schema ---
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  unit: z.nativeEnum(ProductUnit),
  stock: z.coerce.number().min(0, "Estoque deve ser positivo"),
  costPrice: z.coerce.number().min(0.01, "Custo deve ser maior que 0"),
  salePrice: z.coerce.number().min(0.01, "Preço de venda deve ser maior que 0"),
  markup: z.coerce.number().optional(), // We'll calc this, but form can hold it
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

  // --- Smart Pricing Logic ---
  const { setValue } = form;

  // --- Smart Pricing Logic ---
  // --- Smart Pricing Logic ---
  useEffect(() => {
    if (!company || !costPrice || costPrice <= 0) return;

    const tax = (company.defaultTaxRate || 0) / 100;
    const fee = (company.defaultCardFee || 0) / 100;
    const margin = (company.desiredProfit || 0) / 100;
    
    const denominator = 1 - (tax + fee + margin);
    
    let suggestedPrice = 0;
    if (denominator > 0) {
        // Fórmula Smart (Markup Divisor)
        suggestedPrice = costPrice / denominator;
    } else {
        // Fallback de Segurança (Se as taxas somarem > 100%)
        // IMPORTANTE: Deve somar TODAS as taxas, não apenas a margem
        suggestedPrice = costPrice * (1 + tax + fee + margin);
    }

    setValue("salePrice", Number(suggestedPrice.toFixed(2)));

  }, [costPrice, company, setValue]);

  // --- Profit Calculation for "Card" ---
  const taxRate = (company?.defaultTaxRate || 0) / 100;
  const cardFee = (company?.defaultCardFee || 0) / 100;
  
  const taxes = salePrice * (taxRate + cardFee);
  const netRevenue = salePrice - taxes;
  const netProfit = netRevenue - costPrice;
  const realMarkup = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;
  const realMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;


  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (!company) {
          toast.error("Erro: Empresa não identificada.");
          return;
      }

      const payload = {
        ...values,
        companyId: company.id, // Inject companyId
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

        {/* Pricing Section - Highlighted */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border space-y-4">
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
                                onChange={(e) => {
                                    // Custom onChange to likely handle smart logic trigger if useEffect isn't preferred, 
                                    // but useEffect handles it comfortably. 
                                    // Just passing through.
                                    field.onChange(e);
                                }}
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
                            <Input type="number" step="0.01" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormDescription>Calculado automaticamente.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {/* Profit Card / Feedback */}
            {/* Profit Card / Feedback */}
            {costPrice > 0 && salePrice > 0 && (
                <div className={`text-sm p-3 rounded border ${netProfit > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex justify-between items-center font-medium">
                        <span>Lucro Líquido Real:</span>
                        <span>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-2 text-xs opacity-90 border-t border-dashed border-gray-300 pt-2">
                         <div className="flex justify-between">
                            <span>Impostos e Taxas ({(taxRate * 100 + cardFee * 100).toFixed(1)}%):</span>
                            <span className="text-red-600">
                                - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(taxes)}
                            </span>
                        </div>
                         <div className="flex justify-between">
                            <span>Margem Real:</span>
                            <span>{realMargin.toFixed(2)}%</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Markup:</span>
                            <span>{realMarkup.toFixed(2)}%</span>
                        </div>
                    </div>

                    {netProfit <= 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-red-700">
                            <Info className="h-3 w-3" />
                            Cuidado: Prejuízo operacional! Aumente o preço.
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
