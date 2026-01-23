import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ExpenseCategory, ExpenseStatus, type Expense } from "@/types/finance"
import type { CreateExpenseInput } from "@/types/finance"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"

const expenseSchema = z.object({
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  dueDate: z.date({ message: "Data de vencimento é obrigatória" }),
  paidAt: z.date().nullable().optional(),
  status: z.nativeEnum(ExpenseStatus),
  category: z.nativeEnum(ExpenseCategory),
  isInstallment: z.boolean().default(false),
  installments: z.coerce.number().min(1).optional(),
  intervalDays: z.coerce.number().min(1).default(30).optional(),
}).refine(
  (data) => {
    if (data.status === ExpenseStatus.PAID && !data.paidAt) {
      return false
    }
    return true
  },
  {
    message: "Data do pagamento é obrigatória quando o status é 'Pago'",
    path: ["paidAt"],
  }
).refine(
  (data) => {
    if (data.isInstallment && (!data.installments || data.installments <= 1)) {
      return false
    }
    return true
  },
  {
    message: "Número de parcelas deve ser maior que 1 para despesas parceladas",
    path: ["installments"],
  }
)

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseInput) => void
  initialData?: Expense
  isLoading?: boolean
}

const CATEGORY_DESCRIPTIONS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FIXED]: "Custos recorrentes (Aluguel, Salários)",
  [ExpenseCategory.VARIABLE]: "Reposição de Estoque, Insumos",
  [ExpenseCategory.DEBT]: "Empréstimos, Dívidas Antigas",
  [ExpenseCategory.INVESTMENT]: "Equipamentos, Reformas (Capex)",
  [ExpenseCategory.TAX]: "Impostos, Taxas Extras",
}

export function ExpenseForm({ onSubmit, initialData, isLoading }: ExpenseFormProps) {
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      status: initialData?.status || ExpenseStatus.PENDING,
      category: initialData?.category || undefined,
      isInstallment: initialData?.isRecurring || false,
      installments: 1, // Padrão, pois geralmente não é armazenado no tipo Expense
      intervalDays: 30, // Padrão
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
      paidAt: initialData?.paidAt ? new Date(initialData.paidAt) : null,
    },
  })

  const status = useWatch({ control: form.control, name: "status" }) as ExpenseStatus
  const category = useWatch({ control: form.control, name: "category" }) as ExpenseCategory
  const isInstallment = useWatch({ control: form.control, name: "isInstallment" }) as boolean
  const amount = useWatch({ control: form.control, name: "amount" }) as number
  const installments = useWatch({ control: form.control, name: "installments" }) as number | undefined

  function handleSubmit(data: ExpenseFormValues) {
    const payload: CreateExpenseInput = {
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      paidAt: data.status === ExpenseStatus.PAID ? data.paidAt : null,
      status: data.status,
      category: data.category,
      installments: data.isInstallment ? data.installments : 1,
      intervalDays: data.isInstallment ? data.intervalDays : undefined,
    }
    
    // Garante que paidAt seja definido se o Status for PAGO (validado pelo schema, mas seguro como fallback)
    if (data.status === ExpenseStatus.PAID && !payload.paidAt) {
       payload.paidAt = new Date()
    }

    onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Conta de Luz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field}
                    value={field.value as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ExpenseCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{EXPENSE_CATEGORY_LABELS[category]}</span>
                            <span className="text-xs text-muted-foreground">
                            {CATEGORY_DESCRIPTIONS[category]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Vencimento</FormLabel>
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
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {category === ExpenseCategory.FIXED && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Certifique-se de que este valor não está duplicado no 'Custo Fixo Base' nas configurações da empresa.
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <FormLabel className="text-base">Despesa Parcelada/Recorrente?</FormLabel>
              <FormDescription>
                Ative para dividir o valor em parcelas.
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="isInstallment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {isInstallment && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" min="2" {...field} value={field.value as string | number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo (dias)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} value={field.value as string | number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {isInstallment && installments && amount > 0 && (
             <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md text-sm text-primary">
                <p className="font-semibold mb-1">Resumo do Impacto:</p>
                <p>
                  Isso criará <strong>{installments}</strong> despesas de{" "}
                  <strong>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / installments)}
                  </strong>{" "}
                  cada.
                </p>
                <p className="text-xs mt-1 opacity-80">
                  Totalizando: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)}
                </p>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ExpenseStatus.PENDING}>Pendente</SelectItem>
                        <SelectItem value={ExpenseStatus.PAID}>Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {status === ExpenseStatus.PAID && (
               <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Pagamento</FormLabel>
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
                              <span>Hoje</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || new Date()}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Despesa"}
        </Button>
      </form>
    </Form>
  )
}
