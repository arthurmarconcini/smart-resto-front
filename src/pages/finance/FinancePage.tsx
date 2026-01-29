import { useState, useMemo } from "react"

import { 
  Plus, 
  Search, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Filter 
} from "lucide-react"
import { isBefore, startOfDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, usePayExpense } from "@/hooks/useFinance"
import { ExpenseTable } from "./components/ExpenseTable"
import { ExpenseForm } from "./components/ExpenseForm"
import { FinanceForecastCard } from "./components/FinanceForecastCard"
import { ExpenseStatus, type Expense, type CreateExpenseInput } from "@/types/finance"

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export function FinancePage() {
  // State
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  
  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)
  const [deleteExpense, setDeleteExpense] = useState<Expense | undefined>(undefined)

  // Hooks
  const { data: expenses = [], isLoading } = useExpenses({
    month: selectedMonth + 1, // API likely expects 1-12
    year: selectedYear,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  })
  
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const deleteMutation = useDeleteExpense()
  const payExpenseMutation = usePayExpense()

  // Computed Values
  const filteredExpenses = useMemo(() => {
    let result = expenses

    // Filter by Month/Year
    result = result.filter(e => {
       const date = new Date(e.dueDate)
       // Adjust for timezone offset to ensure we get the correct "day" part if needed, 
       // but strictly for Month/Year, simple parsing usually works if ISO string.
       // However, to be safe with local dates:
       return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })

    // Filter by Search
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(e => 
        e.description.toLowerCase().includes(lowerSearch) ||
        e.amount.toString().includes(lowerSearch)
      )
    }

    return result
  }, [expenses, search, selectedMonth, selectedYear])

  const summary = useMemo(() => {
    const today = startOfDay(new Date())
    return filteredExpenses.reduce((acc, expense) => {
      const amount = Number(expense.amount) || 0;
      // Pending
      if (expense.status === ExpenseStatus.PENDING) {
        // Check overdue
        if (isBefore(startOfDay(new Date(expense.dueDate)), today)) {
          acc.overdue += amount
        } else {
          acc.pending += amount
        }
      } 
      // Paid
      else if (expense.status === ExpenseStatus.PAID) {
        acc.paid += amount
      }
      return acc
    }, { pending: 0, paid: 0, overdue: 0 })
  }, [filteredExpenses])

  // Handlers
  const handleOpenCreate = () => {
    setEditingExpense(undefined)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (expense: Expense) => {
    setDeleteExpense(expense)
  }

  const handleSubmit = async (data: CreateExpenseInput) => {
    try {
      if (editingExpense) {
        await updateMutation.mutateAsync({
           id: editingExpense.id,
           data: data
        })
        toast.success("Despesa atualizada com sucesso!")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Despesa criada com sucesso!")
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error("Erro ao salvar despesa.")
      console.error(error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteExpense) return
    try {
      await deleteMutation.mutateAsync(deleteExpense.id)
      toast.success("Despesa excluída com sucesso!")
    } catch {
      toast.error("Erro ao excluir despesa.")
    } finally {
      setDeleteExpense(undefined)
    }
  }

  const handleMarkAsPaid = async (expense: Expense) => {
    try {
      await payExpenseMutation.mutateAsync({
        id: expense.id,
        paidAt: new Date()
      })
      toast.success("Despesa marcada como paga!")
    } catch {
       toast.error("Erro ao atualizar status.")
    }
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Despesas</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      {/* Forecast Card */}
      <FinanceForecastCard month={selectedMonth} year={selectedYear} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pending)}</div>
            <p className="text-xs text-muted-foreground">
              Despesas pendentes deste mês
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago (Mês)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(summary.paid)}</div>
            <p className="text-xs text-muted-foreground">
              Total liquidado este mês
            </p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 shadow-sm ${summary.overdue > 0 ? "border-l-destructive bg-destructive/5" : "border-l-muted"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.overdue)}</div>
            <p className="text-xs text-destructive/80">
              Atenção! Contas atrasadas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-background p-1 py-4 md:p-0 rounded-lg">
         <div className="flex flex-1 items-center gap-2 w-full">
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedYear.toString()} 
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                   <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="hidden md:block h-6 w-px bg-border mx-2" />

            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as ExpenseStatus | "ALL")}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value={ExpenseStatus.PENDING}>Pendente</SelectItem>
                <SelectItem value={ExpenseStatus.PAID}>Pago</SelectItem>
              </SelectContent>
            </Select>
         </div>

         <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                placeholder="Buscar despesa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
         </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-sm">
        <CardContent className="p-0 md:p-6">
           {isLoading ? (
             <div className="flex items-center justify-center h-48">
               <span className="text-muted-foreground">Carregando despesas...</span>
             </div>
           ) : (
             <ExpenseTable 
                expenses={filteredExpenses}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                onMarkAsPaid={handleMarkAsPaid}
             />
           )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
            <DialogDescription>
              Preencha os dados da despesa abaixo.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm 
            onSubmit={handleSubmit} 
            initialData={editingExpense}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteExpense} onOpenChange={(open) => !open && setDeleteExpense(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a despesa <strong>{deleteExpense?.description}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogCancel>Cancelar</AlertDialogCancel>
             <AlertDialogAction 
               onClick={handleConfirmDelete}
               className="bg-destructive hover:bg-destructive/90"
             >
               {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
