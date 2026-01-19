import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Expense, ExpenseCategory, ExpenseStatus } from "@/types/finance"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants"
import { format, isBefore, startOfDay } from "date-fns"
import { MoreHorizontal, Pencil, Trash, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  onMarkAsPaid: (expense: Expense) => void
}

const CATEGORY_COLORS: Record<ExpenseCategory, "default" | "secondary" | "destructive" | "outline"> = {
  [ExpenseCategory.FIXED]: "default", // Blue/Primary usually
  [ExpenseCategory.VARIABLE]: "secondary",
  [ExpenseCategory.DEBT]: "destructive",
  [ExpenseCategory.INVESTMENT]: "outline",
  [ExpenseCategory.TAX]: "secondary", // Reusing secondary or define new variant if needed
}

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  onMarkAsPaid,
}: ExpenseTableProps) {
  
  const totalAmount = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0)
  const today = startOfDay(new Date())

  const getStatusBadge = (expense: Expense) => {
    const dueDate = startOfDay(new Date(expense.dueDate))
    const isOverdue = isBefore(dueDate, today) && expense.status === ExpenseStatus.PENDING

    if (expense.status === ExpenseStatus.PAID) {
      return <Badge className="bg-green-600 hover:bg-green-700">Pago</Badge>
    }
    
    if (isOverdue) {
      return <Badge variant="destructive">Atrasado</Badge>
    }

    return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200">Pendente</Badge>
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Vencimento</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma despesa encontrada.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => {
              const dueDate = startOfDay(new Date(expense.dueDate))
              const isOverdue = isBefore(dueDate, today) && expense.status === ExpenseStatus.PENDING

              return (
                <TableRow key={expense.id}>
                  <TableCell className={cn("font-medium", isOverdue && "text-red-600")}>
                    {format(new Date(expense.dueDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Badge variant={CATEGORY_COLORS[expense.category]}>
                        {EXPENSE_CATEGORY_LABELS[expense.category]}
                      </Badge>
                      {expense.category === ExpenseCategory.DEBT && (
                        <span title="Prioridade de Pagamento" className="flex items-center text-red-600">
                           <AlertCircle className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(expense)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onMarkAsPaid(expense)}
                          disabled={expense.status === ExpenseStatus.PAID}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Pago
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(expense)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Listado</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalAmount)}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
