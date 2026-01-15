import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  FinanceForecast,
  ExpenseFilters,
} from "@/types/finance"

// Keys
export const financeKeys = {
  all: ["finance"] as const,
  expenses: (filters?: ExpenseFilters) => [...financeKeys.all, "expenses", filters] as const,
  forecast: (month?: number, year?: number) =>
    [...financeKeys.all, "forecast", { month, year }] as const,
}

// Queries
export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: financeKeys.expenses(filters),
    queryFn: async () => {
      const { data } = await api.get<Expense[]>("/finance/expenses", {
        params: filters,
      })
      return data
    },
  })
}

export function useFinanceForecast(month?: number, year?: number) {
  return useQuery({
    queryKey: financeKeys.forecast(month, year),
    queryFn: async () => {
      const { data } = await api.get<FinanceForecast>("/finance/forecast", {
        params: { month, year },
      })
      return data
    },
  })
}

// Mutations
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newExpense: CreateExpenseInput) => {
      const { data } = await api.post<Expense>("/finance/expenses", newExpense)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data: updateData,
    }: {
      id: string
      data: UpdateExpenseInput
    }) => {
      const { data } = await api.patch<Expense>(`/finance/expenses/${id}`, updateData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/expenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all })
    },
  })
}
